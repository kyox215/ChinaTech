import * as React from "react"
import { cn } from "@/lib/utils"

interface DataTableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function DataTable({ className, children, ...props }: DataTableProps) {
  return (
    <div className={cn("relative w-full overflow-auto", className)} {...props}>
      <table className="w-full caption-bottom text-sm">
        {children}
      </table>
    </div>
  )
}

interface DataTableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

function DataTableHeader({ className, children, ...props }: DataTableHeaderProps) {
  return (
    <thead className={cn("[&_tr]:border-b", className)} {...props}>
      {children}
    </thead>
  )
}

interface DataTableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode
}

function DataTableBody({ className, children, ...props }: DataTableBodyProps) {
  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props}>
      {children}
    </tbody>
  )
}

interface DataTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode
}

function DataTableRow({ className, children, ...props }: DataTableRowProps) {
  return (
    <tr
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

interface DataTableHeadProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
}

function DataTableHead({ className, children, ...props }: DataTableHeadProps) {
  return (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
}

interface DataTableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode
}

function DataTableCell({ className, children, ...props }: DataTableCellProps) {
  return (
    <td
      className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    >
      {children}
    </td>
  )
}

export {
  DataTable,
  DataTableHeader,
  DataTableBody,
  DataTableRow,
  DataTableHead,
  DataTableCell,
}