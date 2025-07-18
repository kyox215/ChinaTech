#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Newbest-Ricambi 供应商网站爬虫实现
专为 https://newbest-ricambi.com 定制的数据爬取解决方案

作者: MiniMax Agent
日期: 2025-07-18
"""

import asyncio
import aiohttp
import json
import re
import time
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from bs4 import BeautifulSoup
import logging
from urllib.parse import urljoin, urlparse
import hashlib

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class ProductInfo:
    """产品信息数据类"""
    supplier_product_id: str
    supplier_product_code: str
    product_name: str
    brand: str
    model: str
    category: str
    subcategory: str
    condition_grade: str
    original_price: float
    current_price: float
    currency: str
    stock_quantity: int
    min_order_quantity: int
    product_images: List[str]
    product_url: str
    specifications: Dict
    description: str
    last_scraped: str
    
    def to_dict(self) -> Dict:
        """转换为字典格式"""
        return asdict(self)

class NewbestRicambiAdvancedScraper:
    """Newbest-Ricambi 高级爬虫"""
    
    def __init__(self, credentials: Dict[str, str], config: Dict = None):
        self.base_url = "https://newbest-ricambi.com"
        self.username = credentials["username"]
        self.password = credentials["password"]
        self.session = None
        self.is_logged_in = False
        
        # 默认配置
        self.config = {
            'max_concurrent': 5,
            'request_delay': 1.0,
            'timeout': 30,
            'retry_count': 3,
            'save_images': True,
            'detailed_scrape': True,
            **(config or {})
        }
        
        # HTTP请求头
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,zh;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        }
        
        # 统计信息
        self.stats = {
            'products_scraped': 0,
            'categories_found': 0,
            'errors_count': 0,
            'start_time': None,
            'end_time': None
        }
        
    async def initialize_session(self):
        """初始化HTTP会话"""
        connector = aiohttp.TCPConnector(
            limit=self.config['max_concurrent'],
            limit_per_host=self.config['max_concurrent'],
            ttl_dns_cache=300,
            use_dns_cache=True,
            ssl=False
        )
        
        timeout = aiohttp.ClientTimeout(
            total=self.config['timeout'],
            connect=10,
            sock_read=30
        )
        
        self.session = aiohttp.ClientSession(
            connector=connector,
            timeout=timeout,
            headers=self.headers
        )
        
        logger.info("HTTP会话已初始化")
        
    async def login(self) -> bool:
        """登录到Newbest-Ricambi网站"""
        try:
            logger.info("开始登录流程...")
            
            # 1. 访问登录页面
            login_url = f"{self.base_url}/user.php"
            async with self.session.get(login_url) as response:
                if response.status != 200:
                    logger.error(f"访问登录页面失败，状态码: {response.status}")
                    return False
                    
                login_html = await response.text()
                
            # 2. 解析登录表单
            soup = BeautifulSoup(login_html, 'html.parser')
            
            # 查找登录表单
            login_form = soup.find('form', {'method': 'post'}) or soup.find('form')
            if not login_form:
                logger.error("未找到登录表单")
                return False
            
            # 3. 构建登录数据
            form_data = {
                'email': self.username,
                'password': self.password,
                'rememberme': '1'
            }
            
            # 查找隐藏字段
            hidden_inputs = login_form.find_all('input', {'type': 'hidden'})
            for input_field in hidden_inputs:
                name = input_field.get('name')
                value = input_field.get('value', '')
                if name:
                    form_data[name] = value
            
            # 4. 提交登录表单
            async with self.session.post(login_url, data=form_data) as response:
                response_text = await response.text()
                
                # 检查登录是否成功
                success_indicators = [
                    "我的信息", "My Account", "Dashboard", "logout", "kyox215",
                    "account", "profile", "订单", "orders"
                ]
                
                login_success = any(indicator.lower() in response_text.lower() 
                                  for indicator in success_indicators)
                
                if login_success:
                    logger.info("✅ 登录成功")
                    self.is_logged_in = True
                    return True
                else:
                    logger.error("❌ 登录失败，检查用户名和密码")
                    # 保存登录失败页面用于调试
                    with open('login_failed.html', 'w', encoding='utf-8') as f:
                        f.write(response_text)
                    return False
                    
        except Exception as e:
            logger.error(f"登录过程中出现异常: {e}")
            return False
    
    async def get_categories(self) -> List[Dict]:
        """获取所有产品分类"""
        try:
            logger.info("正在获取产品分类...")
            
            async with self.session.get(self.base_url) as response:
                html = await response.text()
                
            soup = BeautifulSoup(html, 'html.parser')
            categories = []
            
            # 查找分类链接的不同选择器
            category_selectors = [
                'div.categories a[href*="category"]',
                'ul.category-menu a',
                'nav a[href*="category"]',
                '.sidebar a[href*="category"]',
                'a[href*="goods.php"]',
                'a[href*="category"]'
            ]
            
            for selector in category_selectors:
                category_links = soup.select(selector)
                if category_links:
                    logger.info(f"使用选择器找到分类: {selector}")
                    break
            
            # 如果没有找到分类链接，尝试查找所有可能的链接
            if not category_links:
                all_links = soup.find_all('a', href=True)
                category_links = [link for link in all_links 
                                if any(keyword in link.get('href', '').lower() 
                                      for keyword in ['category', 'goods', 'repair', 'phone', 'tablet'])]
            
            seen_urls = set()
            
            for link in category_links:
                href = link.get('href', '')
                text = link.get_text(strip=True)
                
                if not href or not text or len(text) > 100:
                    continue
                
                # 构建完整URL
                if href.startswith('/'):
                    full_url = self.base_url + href
                elif href.startswith('http'):
                    full_url = href
                else:
                    full_url = urljoin(self.base_url, href)
                
                # 避免重复
                if full_url in seen_urls:
                    continue
                seen_urls.add(full_url)
                
                # 判断分类层级
                parent_elements = link.find_parents()
                level = len([p for p in parent_elements if p.name in ['ul', 'li', 'div']])
                
                categories.append({
                    'name': text,
                    'url': full_url,
                    'level': min(level, 3),  # 最多3级
                    'priority': self.calculate_category_priority(text, href)
                })
            
            # 按优先级排序
            categories.sort(key=lambda x: x['priority'], reverse=True)
            
            # 去重并限制数量
            unique_categories = []
            seen_names = set()
            
            for cat in categories:
                if cat['name'] not in seen_names and len(unique_categories) < 50:
                    unique_categories.append(cat)
                    seen_names.add(cat['name'])
            
            self.stats['categories_found'] = len(unique_categories)
            logger.info(f"发现 {len(unique_categories)} 个产品分类")
            
            return unique_categories
            
        except Exception as e:
            logger.error(f"获取分类失败: {e}")
            return []
    
    def calculate_category_priority(self, name: str, href: str) -> int:
        """计算分类优先级"""
        priority = 0
        
        # 高优先级关键词
        high_priority_keywords = [
            'iphone', 'samsung', 'huawei', 'xiaomi', 'apple',
            'screen', 'display', 'battery', 'repair parts'
        ]
        
        # 中优先级关键词
        medium_priority_keywords = [
            'phone', 'mobile', 'smartphone', 'android', 'ios'
        ]
        
        name_lower = name.lower()
        href_lower = href.lower()
        
        for keyword in high_priority_keywords:
            if keyword in name_lower or keyword in href_lower:
                priority += 10
                
        for keyword in medium_priority_keywords:
            if keyword in name_lower or keyword in href_lower:
                priority += 5
        
        # 根据分类名称长度调整优先级
        if 5 <= len(name) <= 20:
            priority += 3
        
        return priority
    
    async def scrape_category_products(self, category_url: str, max_pages: int = 20) -> List[ProductInfo]:
        """爬取指定分类的所有产品"""
        try:
            logger.info(f"开始爬取分类: {category_url}")
            
            all_products = []
            page = 1
            consecutive_empty_pages = 0
            
            while page <= max_pages and consecutive_empty_pages < 3:
                logger.info(f"正在爬取第 {page} 页...")
                
                # 构建分页URL
                page_url = self.build_page_url(category_url, page)
                
                try:
                    async with self.session.get(page_url) as response:
                        if response.status != 200:
                            logger.warning(f"页面 {page} 返回状态码: {response.status}")
                            consecutive_empty_pages += 1
                            page += 1
                            continue
                            
                        html = await response.text()
                        
                    # 解析产品列表
                    page_products = await self.parse_products_from_page(html, page_url)
                    
                    if page_products:
                        all_products.extend(page_products)
                        consecutive_empty_pages = 0
                        logger.info(f"第 {page} 页获取到 {len(page_products)} 个产品")
                    else:
                        consecutive_empty_pages += 1
                        logger.info(f"第 {page} 页没有找到产品")
                    
                    page += 1
                    
                    # 延迟避免过于频繁的请求
                    await asyncio.sleep(self.config['request_delay'])
                    
                except Exception as e:
                    logger.error(f"爬取第 {page} 页时出错: {e}")
                    consecutive_empty_pages += 1
                    page += 1
            
            logger.info(f"分类爬取完成，共获取 {len(all_products)} 个产品")
            return all_products
            
        except Exception as e:
            logger.error(f"爬取分类产品失败: {e}")
            return []
    
    def build_page_url(self, base_url: str, page: int) -> str:
        """构建分页URL"""
        if '?' in base_url:
            separator = '&'
        else:
            separator = '?'
        
        # 尝试不同的分页参数名
        page_params = ['page', 'p', 'pagenum', 'pg']
        
        for param in page_params:
            page_url = f"{base_url}{separator}{param}={page}"
            return page_url
        
        return base_url
    
    async def parse_products_from_page(self, html: str, page_url: str) -> List[ProductInfo]:
        """从页面HTML中解析产品信息"""
        try:
            soup = BeautifulSoup(html, 'html.parser')
            products = []
            
            # 多种产品容器选择器
            product_selectors = [
                'div.product-item',
                'div.goods-item',
                'tr.product-row',
                'div.item',
                '.product',
                'tr[id*="goods"]',
                'tr[class*="goods"]'
            ]
            
            product_containers = []
            for selector in product_selectors:
                containers = soup.select(selector)
                if containers:
                    product_containers = containers
                    logger.debug(f"使用选择器找到产品: {selector}")
                    break
            
            # 如果没有找到标准容器，尝试查找表格行
            if not product_containers:
                table_rows = soup.find_all('tr')
                # 过滤掉表头和无用行
                product_containers = [row for row in table_rows 
                                    if len(row.find_all(['td', 'th'])) >= 3
                                    and any(keyword in row.get_text().lower() 
                                           for keyword in ['€', 'eur', 'price', 'stock', 'grade'])]
            
            logger.debug(f"找到 {len(product_containers)} 个产品容器")
            
            for container in product_containers:
                try:
                    product = await self.parse_single_product(container, page_url)
                    if product:
                        products.append(product)
                        self.stats['products_scraped'] += 1
                except Exception as e:
                    logger.debug(f"解析单个产品失败: {e}")
                    self.stats['errors_count'] += 1
            
            return products
            
        except Exception as e:
            logger.error(f"解析页面产品失败: {e}")
            return []
    
    async def parse_single_product(self, container, page_url: str) -> Optional[ProductInfo]:
        """解析单个产品信息"""
        try:
            # 提取产品链接
            product_link = container.find('a', href=True)
            if not product_link:
                return None
            
            product_url = product_link['href']
            if product_url.startswith('/'):
                product_url = self.base_url + product_url
            elif not product_url.startswith('http'):
                product_url = urljoin(self.base_url, product_url)
            
            # 提取基本信息
            product_name = self.extract_product_name(container)
            if not product_name or len(product_name) < 3:
                return None
            
            # 提取价格信息
            price_info = self.extract_price_info(container)
            
            # 提取库存信息
            stock_info = self.extract_stock_info(container)
            
            # 提取图片
            images = self.extract_product_images(container)
            
            # 提取品牌和型号
            brand, model = self.extract_brand_model(product_name)
            
            # 提取状况等级
            condition = self.extract_condition_grade(product_name, container)
            
            # 生成产品ID
            product_id = self.generate_product_id(product_url, product_name)
            
            # 如果启用详细爬取，获取详细信息
            detailed_info = {}
            if self.config['detailed_scrape']:
                detailed_info = await self.get_product_details(product_url)
            
            product = ProductInfo(
                supplier_product_id=product_id,
                supplier_product_code=detailed_info.get('product_code', product_id),
                product_name=product_name,
                brand=brand,
                model=model,
                category=detailed_info.get('category', 'Mobile Parts'),
                subcategory=detailed_info.get('subcategory', ''),
                condition_grade=condition,
                original_price=price_info['original_price'],
                current_price=price_info['current_price'],
                currency=price_info['currency'],
                stock_quantity=stock_info['quantity'],
                min_order_quantity=stock_info['min_order'],
                product_images=images,
                product_url=product_url,
                specifications=detailed_info.get('specifications', {}),
                description=detailed_info.get('description', ''),
                last_scraped=datetime.now().isoformat()
            )
            
            return product
            
        except Exception as e:
            logger.debug(f"解析产品信息失败: {e}")
            return None
    
    def extract_product_name(self, container) -> str:
        """提取产品名称"""
        # 多种名称选择器
        name_selectors = [
            'h3', 'h4', 'h5',
            '.product-name', '.title', '.name',
            'a[title]', 'td:first-child a',
            'strong', 'b'
        ]
        
        for selector in name_selectors:
            elem = container.select_one(selector)
            if elem:
                name = elem.get('title') or elem.get_text(strip=True)
                if name and len(name) >= 3:
                    return name
        
        # 如果都没找到，尝试从链接文本获取
        link = container.find('a')
        if link:
            return link.get_text(strip=True)
        
        return ""
    
    def extract_price_info(self, container) -> Dict:
        """提取价格信息"""
        price_info = {
            'original_price': 0.0,
            'current_price': 0.0,
            'currency': 'EUR'
        }
        
        # 查找价格元素
        price_selectors = [
            '.price', '.cost', '.amount',
            'span[class*="price"]', 'td[class*="price"]',
            'strong', 'b'
        ]
        
        prices_found = []
        
        for selector in price_selectors:
            price_elems = container.select(selector)
            for elem in price_elems:
                price_text = elem.get_text(strip=True)
                price = self.extract_numeric_price(price_text)
                if price > 0:
                    prices_found.append(price)
        
        # 如果没有找到，在整个容器中搜索价格模式
        if not prices_found:
            container_text = container.get_text()
            price_patterns = [
                r'(\d+[.,]\d+)\s*€',
                r'€\s*(\d+[.,]\d+)',
                r'(\d+[.,]\d+)\s*EUR',
                r'EUR\s*(\d+[.,]\d+)',
                r'(\d+[.,]\d+)'
            ]
            
            for pattern in price_patterns:
                matches = re.findall(pattern, container_text)
                for match in matches:
                    price = self.extract_numeric_price(match)
                    if price > 0:
                        prices_found.append(price)
                        break
                if prices_found:
                    break
        
        if prices_found:
            price_info['current_price'] = min(prices_found)  # 使用最小价格
            price_info['original_price'] = max(prices_found)  # 使用最大价格作为原价
        
        return price_info
    
    def extract_numeric_price(self, price_text: str) -> float:
        """从文本中提取数字价格"""
        try:
            # 移除非数字字符，保留数字、小数点和逗号
            clean_text = re.sub(r'[^\d.,]', '', price_text)
            
            if not clean_text:
                return 0.0
            
            # 处理逗号作为小数分隔符的情况
            if ',' in clean_text and '.' in clean_text:
                # 如果同时有逗号和点，假设最后一个是小数分隔符
                if clean_text.rindex(',') > clean_text.rindex('.'):
                    clean_text = clean_text.replace('.', '').replace(',', '.')
                else:
                    clean_text = clean_text.replace(',', '')
            elif ',' in clean_text:
                # 只有逗号，判断是否为小数分隔符
                comma_pos = clean_text.rindex(',')
                if len(clean_text) - comma_pos <= 3:  # 逗号后面2位或3位数字
                    clean_text = clean_text.replace(',', '.')
                else:
                    clean_text = clean_text.replace(',', '')
            
            return float(clean_text)
            
        except (ValueError, AttributeError):
            return 0.0
    
    def extract_stock_info(self, container) -> Dict:
        """提取库存信息"""
        stock_info = {
            'quantity': 0,
            'min_order': 1,
            'is_available': False
        }
        
        container_text = container.get_text().lower()
        
        # 检查库存状态
        if any(keyword in container_text for keyword in ['out of stock', 'sold out', '缺货', '无库存']):
            stock_info['quantity'] = 0
            stock_info['is_available'] = False
        elif any(keyword in container_text for keyword in ['in stock', 'available', '有库存', '现货']):
            stock_info['quantity'] = 10  # 默认库存
            stock_info['is_available'] = True
        else:
            # 尝试从输入框获取最大数量
            quantity_input = container.find('input', {'name': 'quantity'})
            if quantity_input:
                max_qty = quantity_input.get('max', '0')
                try:
                    stock_info['quantity'] = int(max_qty) if max_qty.isdigit() else 5
                    stock_info['is_available'] = stock_info['quantity'] > 0
                except:
                    stock_info['quantity'] = 5
                    stock_info['is_available'] = True
            else:
                # 默认有库存
                stock_info['quantity'] = 5
                stock_info['is_available'] = True
        
        return stock_info
    
    def extract_product_images(self, container) -> List[str]:
        """提取产品图片"""
        images = []
        
        # 查找图片元素
        img_elements = container.find_all('img')
        
        for img in img_elements:
            src = img.get('src') or img.get('data-src') or img.get('data-original')
            if src:
                # 构建完整URL
                if src.startswith('/'):
                    src = self.base_url + src
                elif not src.startswith('http'):
                    src = urljoin(self.base_url, src)
                
                # 过滤掉无效图片
                if self.is_valid_product_image(src):
                    images.append(src)
        
        return images
    
    def is_valid_product_image(self, url: str) -> bool:
        """检查是否为有效的产品图片"""
        invalid_keywords = [
            'logo', 'icon', 'button', 'arrow', 'banner',
            'placeholder', 'loading', '1x1', 'spacer'
        ]
        
        url_lower = url.lower()
        return not any(keyword in url_lower for keyword in invalid_keywords)
    
    def extract_brand_model(self, product_name: str) -> Tuple[str, str]:
        """从产品名称中提取品牌和型号"""
        # 已知品牌列表
        brands = [
            'APPLE', 'SAMSUNG', 'HUAWEI', 'XIAOMI', 'OPPO', 'VIVO', 'ONEPLUS',
            'GOOGLE', 'LG', 'SONY', 'MOTOROLA', 'NOKIA', 'REALME', 'HONOR',
            'IPHONE', 'GALAXY', 'PIXEL', 'XPERIA'
        ]
        
        name_upper = product_name.upper()
        detected_brand = "Unknown"
        detected_model = "Unknown"
        
        # 检测品牌
        for brand in brands:
            if brand in name_upper:
                detected_brand = brand
                break
        
        # 提取型号
        model_patterns = [
            r'IPHONE\s*(\d+\s*(?:PRO|PLUS|MINI|MAX)?)',
            r'GALAXY\s*([A-Z]\d+)',
            r'(\w+\s*\d+\w*)',
            r'([A-Z]+\d+[A-Z]*)',
        ]
        
        for pattern in model_patterns:
            match = re.search(pattern, name_upper)
            if match:
                detected_model = match.group(1).strip()
                break
        
        # 如果没有匹配到模式，使用前几个单词
        if detected_model == "Unknown":
            words = product_name.split()[:3]
            detected_model = " ".join(words)
        
        return detected_brand, detected_model
    
    def extract_condition_grade(self, product_name: str, container) -> str:
        """提取商品状况等级"""
        text_to_check = (product_name + " " + container.get_text()).lower()
        
        condition_mapping = {
            'grade a': 'Grade A',
            'grade b': 'Grade B',
            'grade c': 'Grade C',
            'new in blister': 'New In Blister',
            'original bulk': 'Original Bulk',
            'used': 'Used',
            'refurbished': 'Refurbished',
            'new': 'New',
            'original': 'Original'
        }
        
        for keyword, condition in condition_mapping.items():
            if keyword in text_to_check:
                return condition
        
        return "Unknown"
    
    def generate_product_id(self, product_url: str, product_name: str) -> str:
        """生成产品ID"""
        # 尝试从URL中提取ID
        url_patterns = [
            r'/(\d+)/?$',
            r'id=(\d+)',
            r'product[_-](\d+)',
            r'goods[_-](\d+)'
        ]
        
        for pattern in url_patterns:
            match = re.search(pattern, product_url)
            if match:
                return match.group(1)
        
        # 如果URL中没有ID，使用名称和URL的哈希值
        content = f"{product_name}_{product_url}".encode('utf-8')
        return hashlib.md5(content).hexdigest()[:12]
    
    async def get_product_details(self, product_url: str) -> Dict:
        """获取产品详细信息"""
        try:
            async with self.session.get(product_url) as response:
                if response.status != 200:
                    return {}
                
                html = await response.text()
            
            soup = BeautifulSoup(html, 'html.parser')
            details = {}
            
            # 提取产品编号
            code_patterns = [
                r'ECS\d+',
                r'Product\s*ID:\s*(\w+)',
                r'SKU:\s*(\w+)',
                r'Code:\s*(\w+)'
            ]
            
            page_text = soup.get_text()
            for pattern in code_patterns:
                match = re.search(pattern, page_text, re.IGNORECASE)
                if match:
                    details['product_code'] = match.group(1) if match.groups() else match.group(0)
                    break
            
            # 提取产品描述
            desc_selectors = [
                '.product-description', '.description', '.product-details',
                'div[class*="desc"]', 'p[class*="desc"]'
            ]
            
            for selector in desc_selectors:
                desc_elem = soup.select_one(selector)
                if desc_elem:
                    details['description'] = desc_elem.get_text(strip=True)
                    break
            
            # 提取规格信息
            specs = {}
            spec_tables = soup.find_all('table', class_=['specifications', 'specs', 'details'])
            for table in spec_tables:
                for row in table.find_all('tr'):
                    cells = row.find_all(['td', 'th'])
                    if len(cells) >= 2:
                        key = cells[0].get_text(strip=True)
                        value = cells[1].get_text(strip=True)
                        if key and value:
                            specs[key] = value
            
            details['specifications'] = specs
            
            # 提取所有高质量图片
            images = []
            for img in soup.find_all('img'):
                src = img.get('src') or img.get('data-src')
                if src and self.is_valid_product_image(src):
                    if src.startswith('/'):
                        src = self.base_url + src
                    images.append(src)
            
            details['images'] = images
            
            await asyncio.sleep(0.5)  # 详情页延迟
            
            return details
            
        except Exception as e:
            logger.debug(f"获取产品详情失败 {product_url}: {e}")
            return {}
    
    async def run_full_scrape(self) -> List[ProductInfo]:
        """执行完整的爬取任务"""
        self.stats['start_time'] = datetime.now()
        logger.info("🕷️ 开始Newbest-Ricambi全站爬取任务")
        
        try:
            # 1. 初始化会话
            await self.initialize_session()
            
            # 2. 登录
            if not await self.login():
                raise Exception("登录失败，无法继续爬取")
            
            # 3. 获取分类
            categories = await self.get_categories()
            if not categories:
                raise Exception("未找到任何产品分类")
            
            # 4. 爬取每个分类的产品
            all_products = []
            
            for i, category in enumerate(categories[:10], 1):  # 限制前10个分类
                logger.info(f"🏷️ [{i}/{len(categories[:10])}] 正在爬取分类: {category['name']}")
                
                try:
                    category_products = await self.scrape_category_products(category['url'])
                    
                    # 为产品添加分类信息
                    for product in category_products:
                        product.category = category['name']
                        product.subcategory = f"Level {category['level']}"
                    
                    all_products.extend(category_products)
                    logger.info(f"✅ 分类 '{category['name']}' 完成，获取 {len(category_products)} 个产品")
                    
                    # 分类间的延迟
                    await asyncio.sleep(self.config['request_delay'] * 2)
                    
                except Exception as e:
                    logger.error(f"❌ 爬取分类 '{category['name']}' 失败: {e}")
                    self.stats['errors_count'] += 1
                    continue
            
            self.stats['end_time'] = datetime.now()
            duration = (self.stats['end_time'] - self.stats['start_time']).total_seconds()
            
            logger.info(f"""
🎉 爬取任务完成！
📊 统计信息:
   - 总产品数: {len(all_products)}
   - 分类数: {self.stats['categories_found']}
   - 错误数: {self.stats['errors_count']}
   - 耗时: {duration:.2f} 秒
   - 平均速度: {len(all_products)/duration:.2f} 产品/秒
            """)
            
            return all_products
            
        except Exception as e:
            logger.error(f"❌ 爬取任务失败: {e}")
            return []
            
        finally:
            if self.session:
                await self.session.close()
    
    async def export_to_json(self, products: List[ProductInfo], filename: str = None):
        """导出产品数据到JSON文件"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"newbest_ricambi_products_{timestamp}.json"
        
        products_data = [product.to_dict() for product in products]
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump({
                'scraping_info': {
                    'website': 'https://newbest-ricambi.com',
                    'total_products': len(products),
                    'scraped_at': datetime.now().isoformat(),
                    'stats': self.stats
                },
                'products': products_data
            }, f, ensure_ascii=False, indent=2)
        
        logger.info(f"✅ 产品数据已导出到: {filename}")
        return filename

# 使用示例和测试代码
async def main():
    """主函数"""
    
    # 配置爬虫
    credentials = {
        "username": "kyox215",
        "password": "huangkyox215"
    }
    
    config = {
        'max_concurrent': 3,
        'request_delay': 1.5,
        'timeout': 30,
        'detailed_scrape': True,
        'save_images': True
    }
    
    # 创建爬虫实例
    scraper = NewbestRicambiAdvancedScraper(credentials, config)
    
    try:
        # 执行爬取
        products = await scraper.run_full_scrape()
        
        if products:
            # 导出数据
            filename = await scraper.export_to_json(products)
            
            # 打印示例产品
            logger.info("\n📋 产品示例:")
            for i, product in enumerate(products[:3], 1):
                logger.info(f"""
产品 {i}:
  - 名称: {product.product_name}
  - 品牌: {product.brand} {product.model}
  - 价格: {product.current_price} {product.currency}
  - 状况: {product.condition_grade}
  - 库存: {product.stock_quantity}
  - URL: {product.product_url}
                """)
        else:
            logger.error("❌ 没有爬取到任何产品")
            
    except Exception as e:
        logger.error(f"❌ 执行失败: {e}")

if __name__ == "__main__":
    # 运行爬虫
    asyncio.run(main())
