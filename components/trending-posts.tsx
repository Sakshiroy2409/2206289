// components/trending-posts.tsx
"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { MessageCircle } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"

interface Post {
  id: number
  userId: string
  userName: string
  content: string
  commentCount: number
}

export default function TrendingPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        // Fetch all users
        const usersResponse = await fetch('http://20.244.56.144/evaluation-service/users')
        const usersData = await usersResponse.json()
        
        const userNames = new Map<string, string>()
        
        // Store user names
        for (const [id, name] of Object.entries(usersData.users)) {
          userNames.set(id, name as string)
        }
        
        // Fetch posts for each user
        const userIds = Object.keys(usersData.users)
        const allPosts: Array<{id: number, userId: string, content: string}> = []
        
        for (const userId of userIds) {
          const postsResponse = await fetch(`http://20.244.56.144/evaluation-service/users/${userId}/posts`)
          const postsData = await postsResponse.json()
          
          postsData.posts.forEach((post: any) => {
            allPosts.push({
              id: post.id,
              userId,
              content: post.content
            })
          })
        }
        
        // Fetch comment counts for each post
        const postCommentCounts = new Map<number, number>()
        let maxCommentCount = 0
        
        for (const post of allPosts) {
          const commentsResponse = await fetch(`http://20.244.56.144/evaluation-service/posts/${post.id}/comments`)
          const commentsData = await commentsResponse.json()
          const commentCount = commentsData.comments.length
          
          postCommentCounts.set(post.id, commentCount)
          
          if (commentCount > maxCommentCount) {
            maxCommentCount = commentCount
          }
        }
        
        // Get posts with the maximum comment count
        const trendingPosts = allPosts
          .filter(post => postCommentCounts.get(post.id) === maxCommentCount)
          .map(post => ({
            id: post.id,
            userId: post.userId,
            userName: userNames.get(post.userId) || '',
            content: post.content,
            commentCount: postCommentCounts.get(post.id) || 0
          }))
        
        setPosts(trendingPosts)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching trending posts:', error)
        setLoading(false)
      }
    }

    fetchTrendingPosts()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-[100px]" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={`https://source.unsplash.com/random/100x100?face&${post.userId}`} />
                <AvatarFallback>{post.userName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="font-medium">{post.userName}</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg">{post.content}</div>
            <div className="mt-4 aspect-video rounded-md overflow-hidden">
              <img 
                src={`https://source.unsplash.com/random/800x450?${post.content.split(' ').pop()?.toLowerCase()}`} 
                alt="Post image" 
                className="w-full h-full object-cover"
              />
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex items-center text-muted-foreground">
              <MessageCircle className="mr-2 h-4 w-4" />
              <span>{post.commentCount} comments</span>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}