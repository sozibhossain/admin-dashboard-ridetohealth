"use client";

import React, { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationApi } from "@/lib/api";
import { MainLayout } from "@/components/layout/main-layout";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion } from "framer-motion";

// -----------------------------
// Types
// -----------------------------
type User = {
  _id: string;
  fullName: string;
  profileImage: string | null;
};

type Notification = {
  _id: string;
  senderId: User | null;
  receiverId: User | null;
  title?: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

type ApiResponse = {
  data: {
    notifications: Notification[];
  };
};

// -----------------------------
// Component
// -----------------------------
function Page() {
  const queryClient = useQueryClient();

  // Fetch all notifications - don't pass page parameter if it filters by isRead
  const { data, isLoading, isError, error } = useQuery<ApiResponse>({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.getAll().then((res) => res),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get notifications from the nested data structure
  const notifications = data?.data?.notifications || [];
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  // Mark single as read - FIXED: Ensure we keep the notification in the list
  const markSingleAsRead = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData<ApiResponse>(["notifications"]);

      if (previous?.data?.notifications) {
        queryClient.setQueryData(["notifications"], {
          data: {
            notifications: previous.data.notifications.map((n) =>
              n._id === id ? { ...n, isRead: true } : n
            ),
          },
        });
      }
      
      return { previous };
    },
    onError: (_err, _id, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => {
      // Only invalidate if you want to refresh from server
      // queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Mark all as read - FIXED: Keep all notifications in the list
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previous = queryClient.getQueryData<ApiResponse>(["notifications"]);

      if (previous?.data?.notifications) {
        queryClient.setQueryData(["notifications"], {
          data: {
            notifications: previous.data.notifications.map((n) => ({ ...n, isRead: true })),
          },
        });
      }
      
      return { previous };
    },
    onError: (_err, _variables, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(["notifications"], context.previous);
      }
    },
    onSettled: () => {
      // Only invalidate if you want to refresh from server
      // queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.05 
      } 
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-24">
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error states
  if (isError) {
    return (
      <MainLayout>
        <div className="container mx-auto py-24 text-center">
          <p className="text-red-500 mb-2">Error loading notifications</p>
          <p className="text-sm text-gray-500">{error?.message || "Please try again later"}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {unreadCount}
              </span>
            )}
          </h1>

          {unreadCount > 0 && (
            <button
              className={cn(
                "text-sm text-gray-500 hover:text-gray-700",
                markAllAsReadMutation.isPending && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending || unreadCount === 0}
            >
              {markAllAsReadMutation.isPending ? "Marking..." : "Mark all as read"}
            </button>
          )}
        </div>

        {/* Mutation error */}
        {markAllAsReadMutation.isError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            Error: {markAllAsReadMutation.error?.message}
          </div>
        )}

        {/* Empty state - ONLY show if there are truly no notifications */}
        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No notifications found.
          </div>
        ) : (
          <motion.div 
            className="space-y-3" 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {notifications.map((notification) => {
              const sender = notification.senderId;
              const avatarUrl = sender?.profileImage || null;

              return (
                <motion.div
                  key={notification._id}
                  variants={itemVariants}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg shadow-sm transition-all duration-200 border",
                    !notification.isRead
                      ? "bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  )}
                  onClick={() => {
                    if (!notification.isRead) {
                      markSingleAsRead.mutate(notification._id);
                    }
                  }}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={sender?.fullName || "User"}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    {sender && (
                      <p className="text-xs text-gray-600 font-medium truncate">
                        {sender.fullName}
                      </p>
                    )}
                    <p className="text-sm text-gray-800 leading-snug mt-1 break-words">
                      {notification.title && (
                        <strong className="font-semibold">
                          {notification.title}:{" "}
                        </strong>
                      )}
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  {/* Unread indicator + action */}
                  {!notification.isRead && (
                    <div className="flex items-center gap-3 ml-auto flex-shrink-0">
                      <button
                        className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer whitespace-nowrap"
                        onClick={(e) => {
                          e.stopPropagation();
                          markSingleAsRead.mutate(notification._id);
                        }}
                        disabled={markSingleAsRead.isPending}
                      >
                        {markSingleAsRead.isPending ? "Marking..." : "Mark as read"}
                      </button>
                      <span
                        className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"
                        aria-label="Unread notification"
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
}

export default Page;