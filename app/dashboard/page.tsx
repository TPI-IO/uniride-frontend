'use client';  // <-- Indica que es Client Component

import {Suspense} from "react"
import DashboardStats from "@/components/dashboard/dashboard-stats"
import CurrentRide from "@/components/dashboard/current-ride"
import RecentRides from "@/components/dashboard/recent-rides"
import QuickActions from "@/components/dashboard/quick-actions"
import LoadingSpinner from "@/components/ui/loading-spinner"
import {SidebarTrigger} from "@/components/ui/sidebar"
import {useAuthGuard} from "@/hooks/useAuthGuard";

export default function DashboardPage() {
    useAuthGuard(); // Esto bloquea el acceso si no hay usuario

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <SidebarTrigger/>
                <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>
            </div>

            <Suspense fallback={<LoadingSpinner/>}>
                <DashboardStats/>
            </Suspense>

            <QuickActions/>

            <div className="grid gap-6 md:grid-cols-2">
                <Suspense fallback={<LoadingSpinner/>}>
                    <CurrentRide/>
                </Suspense>

                <Suspense fallback={<LoadingSpinner/>}>
                    <RecentRides/>
                </Suspense>
            </div>
        </div>
    )
}
