"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { Header } from "./header"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <main className="ml-[173px] mt-[70px] p-6">{children}</main>
    </div>
  )
}
