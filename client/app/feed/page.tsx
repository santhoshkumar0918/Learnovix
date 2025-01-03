// "use client";

// import { useState, useRef } from "react";
// import { useRouter } from "next/router";
// import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
// import { useUser } from "@clerk/nextjs";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { createClient } from "@supabase/supabase-js";
// import {
//   HeartIcon as HeartOutline,
//   ChatBubbleOvalLeftEllipsisIcon,
//   ShareIcon,
//   PhotoIcon,
//   XMarkIcon,
//   PencilIcon,
//   TrashIcon,
// } from "@heroicons/react/24/outline";
// import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

// interface Post {
//   id: string;
//   content: string;
//   created_at: string;
//   user_id: string;
//   image_url?: string;
//   comments: Comment[];
//   likes: Like[];
// }
// interface User {
//   id: string;
//   username: string;
//   full_name: string;
//   avatar_url: string;
//   followers: string[];
//   following: string[];
// }

// interface Post {
//   user: User;
//   bookmarked: boolean;
//   repost_count: number;
// }

// interface Comment {
//   id: string;
//   content: string;
//   user_id: string;
//   created_at: string;
// }

// interface Like {
//   id: string;
//   user_id: string;
// }

// export default function Feed() {
//   const [activeTab, setActiveTab] = useState("foryou");
//   const [content, setContent] = useState("");
//   const [editContent, setEditContent] = useState<string | null>(null);
//   const [commentContent, setCommentContent] = useState<Record<string, string>>(
//     {}
//   );
//   const [selectedImage, setSelectedImage] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [showComments, setShowComments] = useState<Record<string, boolean>>({});
//   const imageInputRef = useRef<HTMLInputElement>(null);
//   const { user, isLoaded } = useUser();
//   const router = useRouter();
//   const queryClient = useQueryClient();

//   const { data: posts, isLoading } = useQuery({
//     queryKey: ["posts"],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("posts")
//         .select(
//           `
//           id, content, created_at, user_id, image_url,
//           comments(id, content, user_id, created_at),
//           likes(id, user_id)
//         `
//         )
//         .order("created_at", { ascending: false });
//       if (error) throw error;
//       return data as Post[];
//     },
//     enabled: isLoaded && !!user,
//   });

//   const uploadImage = async (file: File) => {
//     const fileExt = file.name.split(".").pop();
//     const fileName = `${Math.random()}.${fileExt}`;
//     const { error: uploadError } = await supabase.storage
//       .from("post-images")
//       .upload(fileName, file);
//     if (uploadError) throw uploadError;
//     return fileName;
//   };

//   const createPost = useMutation({
//     mutationFn: async () => {
//       if (!user) throw new Error("User not authenticated");

//       const { data: userData } = await supabase
//         .from("users")
//         .select("id")
//         .eq("clerk_id", user.id)
//         .single();

//       let imagePath = null;
//       if (selectedImage) {
//         imagePath = await uploadImage(selectedImage);
//       }

//       const { error } = await supabase.from("posts").insert({
//         content,
//         user_id: userData?.id,
//         image_url: imagePath,
//       });

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["posts"] });
//       setContent("");
//       setSelectedImage(null);
//       setImagePreview(null);
//     },
//   });

//   const editPost = useMutation({
//     mutationFn: async ({
//       postId,
//       newContent,
//     }: {
//       postId: string;
//       newContent: string;
//     }) => {
//       const { error } = await supabase
//         .from("posts")
//         .update({ content: newContent })
//         .eq("id", postId);

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["posts"] });
//       setEditContent(null); 
//     },
//   });

//   const deletePost = useMutation({
//     mutationFn: async (postId: string) => {
//       const { error } = await supabase.from("posts").delete().eq("id", postId);

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["posts"] });
//     },
//   });

//   const toggleLike = useMutation({
//     mutationFn: async (postId: string) => {
//       if (!user) throw new Error("User not authenticated");

//       const { data: userData } = await supabase
//         .from("users")
//         .select("id")
//         .eq("clerk_id", user.id)
//         .single();

//       const { data: existingLike } = await supabase
//         .from("likes")
//         .select("*")
//         .eq("post_id", postId)
//         .eq("user_id", userData?.id)
//         .single();

//       if (existingLike) {
//         await supabase.from("likes").delete().eq("id", existingLike.id);
//       } else {
//         await supabase.from("likes").insert({
//           post_id: postId,
//           user_id: userData?.id,
//         });
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["posts"] });
//     },
//   });

//   const addComment = useMutation({
//     mutationFn: async ({
//       postId,
//       content,
//     }: {
//       postId: string;
//       content: string;
//     }) => {
//       if (!user) throw new Error("User not authenticated");

//       const { data: userData } = await supabase
//         .from("users")
//         .select("id")
//         .eq("clerk_id", user.id)
//         .single();

//       const { error } = await supabase.from("comments").insert({
//         content,
//         post_id: postId,
//         user_id: userData?.id,
//       });

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["posts"] });
//       setCommentContent({});
//     },
//   });

//   const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setSelectedImage(file);
//       const reader = new FileReader();
//       reader.onloadend = () => setImagePreview(reader.result as string);
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleShare = async (post: Post) => {
//     try {
//       await navigator.share({
//         title: "Check out this post!",
//         text: post.content,
//         url: window.location.href,
//       });
//     } catch (error) {
//       console.error("Error sharing:", error);
//     }
//   };

//   const toggleFollow = useMutation({
//     mutationFn: async (targetUserId: string) => {
//       const { data: userData } = await supabase
//         .from("users")
//         .select("following")
//         .eq("clerk_id", user?.id)
//         .single();

//       const isFollowing = userData?.following?.includes(targetUserId);
//       const newFollowing = isFollowing
//         ? userData?.following?.filter((id: string) => id !== targetUserId) || []
//         : [...(userData?.following || []), targetUserId];

//       await supabase
//         .from("users")
//         .update({ following: newFollowing })
//         .eq("clerk_id", user?.id);
//     },
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", "posts"] }),
//   });

//   const toggleBookmark = useMutation({
//     mutationFn: async (postId: string) => {
//       const { data: existing } = await supabase
//         .from("bookmarks")
//         .select("id")
//         .eq("post_id", postId)
//         .eq("user_id", user?.id)
//         .single();

//       if (existing) {
//         await supabase.from("bookmarks").delete().eq("id", existing.id);
//       } else {
//         await supabase.from("bookmarks").insert({
//           post_id: postId,
//           user_id: user?.id,
//         });
//       }
//     },
//     onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
//   });

//   return (
//     <div className="min-h-screen bg-gray-800 text-white">
//       <div className="max-w-2xl mx-auto px-4 py-6">
//         {/* Tabs */}
//         <div className="flex mb-6 bg-gray-700 rounded-xl overflow-hidden">
//           <button
//             onClick={() => setActiveTab("foryou")}
//             className={`flex-1 py-3 ${
//               activeTab === "foryou"
//                 ? "bg-blue-500 text-white"
//                 : "text-gray-300 hover:bg-gray-600"
//             }`}
//           >
//             For You
//           </button>
//           <button
//             onClick={() => setActiveTab("following")}
//             className={`flex-1 py-3 ${
//               activeTab === "following"
//                 ? "bg-blue-500 text-white"
//                 : "text-gray-300 hover:bg-gray-600"
//             }`}
//           >
//             Following
//           </button>
//         </div>
//         {/* Create Post */}
//         <div className="bg-gray-700 rounded-xl p-6 mb-6 shadow-xl transform transition-all hover:scale-105 duration-300 ease-in-out">
//           <div className="flex items-start space-x-3">
//             <img
//               src={user?.imageUrl}
//               alt="Profile"
//               className="w-12 h-12 rounded-full transition-transform hover:scale-110"
//             />
//             <div className="flex-1 space-y-4">
//               <textarea
//                 value={content}
//                 onChange={(e) => setContent(e.target.value)}
//                 placeholder="What's on your mind?"
//                 className="w-full bg-gray-600 rounded-lg p-4 text-white placeholder-gray-400 border-none resize-none focus:ring-2 focus:ring-blue-500 min-h-[120px] focus:outline-none"
//               />
//               {imagePreview && (
//                 <div className="relative rounded-lg overflow-hidden shadow-lg">
//                   <img
//                     src={imagePreview}
//                     alt="Preview"
//                     className="max-h-96 w-full object-cover transition-transform duration-500 transform hover:scale-105"
//                   />
//                   <button
//                     onClick={() => {
//                       setImagePreview(null);
//                       setSelectedImage(null);
//                     }}
//                     className="absolute top-2 right-2 p-2 bg-gray-900 rounded-full hover:bg-gray-800"
//                   >
//                     <XMarkIcon className="w-6 h-6 text-white" />
//                   </button>
//                 </div>
//               )}
//               <div className="flex items-center justify-between">
//                 <input
//                   ref={imageInputRef}
//                   type="file"
//                   accept="image/*"
//                   onChange={handleImageSelect}
//                   className="hidden"
//                 />
//                 <button
//                   onClick={() => imageInputRef.current?.click()}
//                   className="text-white flex items-center space-x-2 hover:text-blue-500"
//                 >
//                   <PhotoIcon className="w-6 h-6" />
//                   <span>Upload Image</span>
//                 </button>
//                 <button
//                   onClick={() => createPost.mutate()}
//                   disabled={!content && !selectedImage}
//                   className="text-white bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
//                 >
//                   Post
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//         {/* Feed Posts */}
//         {isLoading ? (
//           <PostsSkeleton />
//         ) : (
//           posts?.map((post) => (
//             <article
//               key={post.id}
//               className="bg-gray-700 rounded-xl p-6 mb-6 shadow-lg hover:scale-105 transition-all duration-300"
//             >
//               <div className="flex items-start space-x-3">
//                 <Avatar
//                   src={post.user.avatar_url}
//                   alt={post.user.username}
//                   className="cursor-pointer"
//                   onClick={() => router.push(`/profile/${post.user.username}`)}
//                 />

//                 <div className="flex-1">
//                   <div className="flex justify-between items-center mb-3">
//                     <div className="flex items-center space-x-2">
//                       <span
//                         className="font-bold hover:underline cursor-pointer"
//                         onClick={() => router.push(`/profile/${post.user.username}`)}
//                       >
//                         {post.user.full_name}
//                       </span>
//                       <span className="text-gray-400">@{post.user.username}</span>
//                       <span className="text-gray-400">·</span>
//                       <time className="text-gray-400">
//                         {format(new Date(post.created_at), 'MMM d')}
//                       </time>
//                     </div>

//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button variant="ghost" size="sm">
//                           <EllipsisHorizontalIcon className="h-5 w-5" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent>
//                         {post.user_id === user?.id ? (
//                           <>
//                             <DropdownMenuItem onClick={() => setEditContent(post.id)}>
//                               <PencilIcon className="w-4 h-4 mr-2" />
//                               Edit
//                             </DropdownMenuItem>
//                             <DropdownMenuItem
//                               onClick={() => deletePost.mutate(post.id)}
//                               className="text-red-500"
//                             >
//                               <TrashIcon className="w-4 h-4 mr-2" />
//                               Delete
//                             </DropdownMenuItem>
//                           </>
//                         ) : (
//                           <>
//                             <DropdownMenuItem onClick={() => toggleFollow.mutate(post.user_id)}>
//                               {post.user.followers?.includes(user?.id ?? "") ? (
//                                 <>
//                                   <UserMinusIcon className="w-4 h-4 mr-2" />
//                                   Unfollow
//                                 </>
//                               ) : (
//                                 <>
//                                   <UserPlusIcon className="w-4 h-4 mr-2" />
//                                   Follow
//                                 </>
//                               )}
//                             </DropdownMenuItem>
//                             <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
//                               <ExclamationCircleIcon className="w-4 h-4 mr-2" />
//                               Report
//                             </DropdownMenuItem>
//                           </>
//                         )}
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </div>

//                   {editContent === post.id ? (
//                     <div>
//                       <textarea
//                         value={post.content}
//                         onChange={(e) => setEditContent(e.target.value)}
//                         className="w-full bg-gray-600 rounded-lg p-4 text-white placeholder-gray-400 border-none resize-none focus:ring-2 focus:ring-blue-500 min-h-[120px] focus:outline-none"
//                       />
//                     </div>
//                   ) : (
//                     <div>{post.content}</div>
//                   )}

//                   {post.image_url && (
//                     <img
//                       src={post.image_url}
//                       alt="Post Image"
//                       className="w-full mt-4 rounded-lg object-cover"
//                     />
//                   )}

//                   <div className="flex items-center justify-between mt-4">
//                     <button
//                       onClick={() => toggleLike.mutate(post.id)}
//                       className="flex items-center space-x-2 text-gray-400 hover:text-red-500"
//                     >
//                       {post.likes.some((like) => like.user_id === user?.id) ? (
//                         <HeartSolid className="w-6 h-6" />
//                       ) : (
//                         <HeartOutline className="w-6 h-6" />
//                       )}
//                       <span>{post.likes.length}</span>
//                     </button>

//                     <button
//                       onClick={() => setShowComments((prev) => ({
//                         ...prev,
//                         [post.id]: !prev[post.id],
//                       }))}
//                       className="flex items-center space-x-2 text-gray-400 hover:text-blue-500"
//                     >
//                       <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
//                       <span>{post.comments.length}</span>
//                     </button>

//                     <button
//                       onClick={() => toggleBookmark.mutate(post.id)}
//                       className="flex items-center space-x-2 text-gray-400 hover:text-yellow-500"
//                     >
//                       <BookmarkIcon
//                         className={`w-6 h-6 ${post.bookmarked ? 'fill-current' : ''}`}
//                       />
//                     </button>
//                   </div>

//                   {showComments[post.id] && (
//                     <div className="mt-4 space-y-4">
//                       {post.comments.map((comment) => (
//                         <div
//                           key={comment.id}
//                           className="bg-gray-800 p-4 rounded-lg"
//                         >
//                           <div>{comment.content}</div>
//                         </div>
//                       ))}
//                       <div className="mt-4 flex space-x-3">
//                         <input
//                           type="text"
//                           value={commentContent[post.id] || ""}
//                           onChange={(e) =>
//                             setCommentContent((prev) => ({
//                               ...prev,
//                               [post.id]: e.target.value,
//                             }))
//                           }
//                           placeholder="Add a comment..."
//                           className="w-full bg-gray-600 text-white p-2 rounded-lg"
//                         />
//                         <button
//                           onClick={() =>
//                             addComment.mutate({
//                               postId: post.id,
//                               content: commentContent[post.id],
//                             })
//                           }
//                           disabled={!commentContent[post.id]}
//                           className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
//                         >
//                           Comment
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </article>
//           ))
//         )}

//     </div>
//   );
// }

 //----------------------------------------------------------------------------------------------------------------
 // THIS ABOVE CODE IS WORKING
 //----------------------------------------------------------------------------------------------------------------

// "use client";
// import { useState, useRef } from "react";
// import { useUser } from "@clerk/nextjs";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { createClient } from "@supabase/supabase-js";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Input } from "@/components/ui/input";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Separator } from "@/components/ui/separator";
// import {
//   Heart,
//   MessageCircle,
//   Share,
//   Image as ImageIcon,
//   MoreVertical,
//   Pencil,
//   Trash2,
//   X,
//   Loader2,
//   Send,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { format, formatDistanceToNow } from "date-fns";
// import { motion, AnimatePresence } from "framer-motion";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

// interface Post {
//   id: string;
//   content: string;
//   created_at: string;
//   user_id: string;
//   image_url?: string;
//   comments: Comment[];
//   likes: Like[];
// }

// interface Comment {
//   id: string;
//   content: string;
//   user_id: string;
//   created_at: string;
// }

// interface Like {
//   id: string;
//   user_id: string;
// }

// export default function Feed() {
//   const [content, setContent] = useState("");
//   const [editingPost, setEditingPost] = useState<{
//     id: string;
//     content: string;
//   } | null>(null);
//   const [commentContent, setCommentContent] = useState<Record<string, string>>(
//     {}
//   );
//   const [selectedImage, setSelectedImage] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [showComments, setShowComments] = useState<Record<string, boolean>>({});
//   const imageInputRef = useRef<HTMLInputElement>(null);
//   const { user, isLoaded } = useUser();
//   const queryClient = useQueryClient();

//   const { data: posts, isLoading } = useQuery({
//     queryKey: ["posts"],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("posts")
//         .select(
//           `
//           id, content, created_at, user_id, image_url,
//           comments(id, content, user_id, created_at),
//           likes(id, user_id)
//         `
//         )
//         .order("created_at", { ascending: false });
//       if (error) throw error;
//       return data as Post[];
//     },
//     enabled: isLoaded && !!user,
//   });

//   const createPost = useMutation({
//     mutationFn: async () => {
//       if (!user) throw new Error("User not authenticated");

//       const { data: userData } = await supabase
//         .from("users")
//         .select("id")
//         .eq("clerk_id", user.id)
//         .single();

//       let imagePath = null;
//       if (selectedImage) {
//         imagePath = await uploadImage(selectedImage);
//       }

//       const { error } = await supabase.from("posts").insert({
//         content,
//         user_id: userData?.id,
//         image_url: imagePath,
//       });

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["posts"] });
//       setContent("");
//       setSelectedImage(null);
//       setImagePreview(null);
//     },
//   });

//   const addComment = useMutation({
//     mutationFn: async ({
//       postId,
//       content,
//     }: {
//       postId: string;
//       content: string;
//     }) => {
//       if (!user) throw new Error("User not authenticated");

//       const { data: userData } = await supabase
//         .from("users")
//         .select("id")
//         .eq("clerk_id", user.id)
//         .single();

//       const { error } = await supabase.from("comments").insert({
//         content,
//         post_id: postId,
//         user_id: userData?.id,
//       });

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["posts"] });
//       setCommentContent({});
//     },
//   });

//   const toggleLike = useMutation({
//     mutationFn: async (postId: string) => {
//       if (!user) throw new Error("User not authenticated");

//       const { data: userData } = await supabase
//         .from("users")
//         .select("id")
//         .eq("clerk_id", user.id)
//         .single();

//       const { data: existingLike } = await supabase
//         .from("likes")
//         .select("*")
//         .eq("post_id", postId)
//         .eq("user_id", userData?.id)
//         .single();

//       if (existingLike) {
//         await supabase.from("likes").delete().eq("id", existingLike.id);
//       } else {
//         await supabase.from("likes").insert({
//           post_id: postId,
//           user_id: userData?.id,
//         });
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["posts"] });
//     },
//   });

//   const deletePost = useMutation({
//     mutationFn: async (postId: string) => {
//       const { error } = await supabase.from("posts").delete().eq("id", postId);

//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["posts"] });
//     },
//   });

//   const editPost = useMutation({
//     mutationFn: async ({
//       postId,
//       newContent,
//     }: {
//       postId: string;
//       newContent: string;
//     }) => {
//       const { error } = await supabase
//         .from("posts")
//         .update({ content: newContent })
//         .eq("id", postId);
//       if (error) throw error;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["posts"] });
//       setEditingPost(null);
//     },
//   });


//   const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       setSelectedImage(file);
//       const reader = new FileReader();
//       reader.onloadend = () => setImagePreview(reader.result as string);
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleShare = async (post: Post) => {
//     try {
//       await navigator.share({
//         title: "Check out this post!",
//         text: post.content,
//         url: window.location.href,
//       });
//     } catch (error) {
//       console.error("Error sharing:", error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
//       <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
//         {/* Create Post Card */}
//         <Card className="border-none shadow-xl bg-white dark:bg-gray-800 overflow-hidden">
//           <CardHeader className="space-y-4 pb-3">
//             <div className="flex items-start space-x-4">
//               <Avatar className="w-12 h-12 border-2 border-teal-500">
//                 <AvatarImage src={user?.imageUrl} alt="Profile" />
//                 <AvatarFallback className="bg-teal-100 text-teal-700">
//                   {user?.firstName?.[0] || "U"}
//                 </AvatarFallback>
//               </Avatar>
//               <Textarea
//                 value={content}
//                 onChange={(e) => setContent(e.target.value)}
//                 placeholder="Share your thoughts..."
//                 className="flex-1 min-h-[120px] resize-none focus:ring-2 focus:ring-teal-500 border-none bg-gray-50 dark:bg-gray-700"
//               />
//             </div>
//           </CardHeader>

//           {imagePreview && (
//             <CardContent className="pt-0">
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="relative rounded-xl overflow-hidden"
//               >
//                 <img
//                   src={imagePreview}
//                   alt="Preview"
//                   className="max-h-96 w-full object-cover"
//                 />
//                 <Button
//                   variant="secondary"
//                   size="icon"
//                   className="absolute top-2 right-2 rounded-full opacity-75 hover:opacity-100"
//                   onClick={() => {
//                     setImagePreview(null);
//                     setSelectedImage(null);
//                   }}
//                 >
//                   <X className="h-4 w-4" />
//                 </Button>
//               </motion.div>
//             </CardContent>
//           )}

//           <CardFooter className="justify-between pt-2">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => imageInputRef.current?.click()}
//               className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/30"
//             >
//               <ImageIcon className="w-4 h-4 mr-2" />
//               Add Photo
//             </Button>
//             <input
//               ref={imageInputRef}
//               type="file"
//               accept="image/*"
//               onChange={handleImageSelect}
//               className="hidden"
//             />
//             <Button
//               onClick={() => createPost.mutate()}
//               disabled={(!content && !selectedImage) || createPost.isPending}
//               className="bg-teal-600 hover:bg-teal-700 text-white"
//             >
//               {createPost.status === "pending" ? (
//                 <Loader2 className="w-4 h-4 animate-spin mr-2" />
//               ) : null}
//               Share Post
//             </Button>
//           </CardFooter>
//         </Card>

//         {/* Posts Feed */}
//         <div className="space-y-6">
//           <AnimatePresence>
//             {isLoading ? (
//               <div className="flex justify-center py-8">
//                 <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
//               </div>
//             ) : (
//               posts?.map((post, index) => (
//                 <motion.div
//                   key={post.id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: index * 0.1 }}
//                 >
//                   <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-800">
//                     <CardHeader className="space-y-4">
//                       <div className="flex items-start justify-between">
//                         <div className="flex items-center space-x-3">
//                           <Avatar className="w-10 h-10 border-2 border-teal-500/20">
//                             <AvatarImage src={user?.imageUrl} alt="Profile" />
//                             <AvatarFallback className="bg-teal-100 text-teal-700">
//                               {post.user_id ? post.user_id[0] : "U"}
//                             </AvatarFallback>
//                           </Avatar>
//                           <div>
//                             <div className="font-semibold text-gray-900 dark:text-gray-100">
//                               {post.user_id}
//                             </div>
//                             <div className="text-sm text-gray-500">
//                               {formatDistanceToNow(new Date(post.created_at), {
//                                 addSuffix: true,
//                               })}
//                             </div>
//                           </div>
//                         </div>

//                         {user?.id === post.user_id && (
//                           <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                               <Button
//                                 variant="ghost"
//                                 size="icon"
//                                 className="hover:bg-gray-100 dark:hover:bg-gray-700"
//                               >
//                                 <MoreVertical className="h-4 w-4" />
//                               </Button>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align="end" className="w-48">
//                               <DropdownMenuItem
//                                 onClick={() =>
//                                   setEditingPost({
//                                     id: post.id,
//                                     content: post.content,
//                                   })
//                                 }
//                                 className="flex items-center"
//                               >
//                                 <Pencil className="h-4 w-4 mr-2" />
//                                 Edit Post
//                               </DropdownMenuItem>
//                               <DropdownMenuItem
//                                 onClick={() => deletePost.mutate(post.id)}
//                                 className="text-red-600 flex items-center"
//                               >
//                                 <Trash2 className="h-4 w-4 mr-2" />
//                                 Delete Post
//                               </DropdownMenuItem>
//                             </DropdownMenuContent>
//                           </DropdownMenu>
//                         )}
//                       </div>
//                     </CardHeader>

//                     <CardContent className="space-y-4">
//                       {editingPost?.id === post.id ? (
//                         <motion.div
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                           className="space-y-4"
//                         >
//                           <Textarea
//                             value={editingPost.content}
//                             onChange={(e) =>
//                               setEditingPost({
//                                 ...editingPost,
//                                 content: e.target.value,
//                               })
//                             }
//                             className="w-full bg-gray-50 dark:bg-gray-700 border-none"
//                           />
//                           <div className="flex justify-end space-x-2">
//                             <Button
//                               variant="outline"
//                               onClick={() => setEditingPost(null)}
//                               className="border-gray-200 dark:border-gray-600"
//                             >
//                               Cancel
//                             </Button>
//                             <Button
//                               onClick={() =>
//                                 editPost.mutate({
//                                   postId: editingPost.id,
//                                   newContent: editingPost.content,
//                                 })
//                               }
//                               className="bg-teal-600 hover:bg-teal-700 text-white"
//                             >
//                               Save Changes
//                             </Button>
//                           </div>
//                         </motion.div>
//                       ) : (
//                         <div className="space-y-4">
//                           <p className="text-gray-800 dark:text-gray-200 text-lg">
//                             {post.content}
//                           </p>
//                           {post.image_url && (
//                             <img
//                               src={post.image_url}
//                               alt="Post"
//                               className="w-full rounded-xl object-cover shadow-sm"
//                             />
//                           )}
//                         </div>
//                       )}
//                     </CardContent>

//                     <CardFooter className="flex flex-col pt-4">
//                       <div className="flex justify-between w-full">
//                         <div className="flex space-x-4">
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => toggleLike.mutate(post.id)}
//                             className={cn(
//                               "text-gray-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30",
//                               post.likes.length && "text-red-600"
//                             )}
//                           >
//                             <Heart
//                               className={cn(
//                                 "h-4 w-4 mr-2",
//                                 post.likes.length && "fill-current"
//                               )}
//                             />
//                             {post.likes.length}
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() =>
//                               setShowComments((prev) => ({
//                                 ...prev,
//                                 [post.id]: !prev[post.id],
//                               }))
//                             }
//                             className="text-gray-600 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30"
//                           >
//                             <MessageCircle className="h-4 w-4 mr-2" />
//                             {post.comments.length}
//                           </Button>
//                           <Button
//                             variant="ghost"
//                             size="sm"
//                             onClick={() => handleShare(post)}
//                             className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
//                           >
//                             <Share className="h-4 w-4 mr-2" />
//                             Share
//                           </Button>
//                         </div>
//                       </div>

//                       <AnimatePresence>
//                         {showComments[post.id] && (
//                           <motion.div
//                             initial={{ opacity: 0, height: 0 }}
//                             animate={{ opacity: 1, height: "auto" }}
//                             exit={{ opacity: 0, height: 0 }}
//                             className="w-full mt-4"
//                           >
//                             <Separator className="my-4" />
//                             <div className="space-y-4">
//                               {post.comments.map((comment) => (
//                                 <Card
//                                   key={comment.id}
//                                   className="bg-gray-50 dark:bg-gray-700 border-none"
//                                 >
//                                   <CardContent className="p-3">
//                                     <div className="flex items-start space-x-3">
//                                       <Avatar className="w-8 h-8">
//                                         <AvatarFallback className="text-sm">
//                                           {comment.user_id[0]}
//                                         </AvatarFallback>
//                                       </Avatar>
//                                       <div className="flex-1">
//                                         <p className="text-sm text-gray-800 dark:text-gray-200">
//                                           {comment.content}
//                                         </p>
//                                         <p className="text-xs text-gray-500 mt-1">
//                                           {formatDistanceToNow(
//                                             new Date(comment.created_at),
//                                             { addSuffix: true }
//                                           )}
//                                         </p>
//                                       </div>
//                                     </div>
//                                   </CardContent>
//                                 </Card>
//                               ))}
//                               <div className="flex space-x-2">
//                                 <Input
//                                   value={commentContent[post.id] || ""}
//                                   onChange={(e) =>
//                                     setCommentContent((prev) => ({
//                                       ...prev,
//                                       [post.id]: e.target.value,
//                                     }))
//                                   }
//                                   placeholder="Write a comment..."
//                                   className="flex-1 bg-gray-50 dark:bg-gray-700 border-none"
//                                 />
//                                 <Button
//                                   onClick={() =>
//                                     addComment.mutate({
//                                       postId: post.id,
//                                       content: commentContent[post.id],
//                                     })
//                                   }
//                                   disabled={
//                                     !commentContent[post.id]?.trim() ||
//                                     addComment.status === "pending"
//                                   }
//                                   className="bg-teal-600 hover:bg-teal-700 text-white"
//                                 >
//                                   {createPost.status === "pending" ? (
//                                     <Loader2 className="w-4 h-4 animate-spin" />
//                                   ) : (
//                                     <Send className="w-4 h-4" />
//                                   )}
//                                 </Button>
//                               </div>
//                             </div>
//                           </motion.div>
//                         )}
//                       </AnimatePresence>
//                     </CardFooter>
//                   </Card>
//                 </motion.div>
//               ))
//             )}
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   );
// }
// async function uploadImage(file: File): Promise<string> {
//   const fileExt = file.name.split(".").pop();
//   const fileName = `${Math.random()}.${fileExt}`;
//   const { error, data } = await supabase.storage
//     .from("post-images")
//     .upload(fileName, file);
//   if (error) throw error;
//   return data.path;
// }

"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";

import {
  HeartIcon as HeartOutline,
  ChatBubbleOvalLeftEllipsisIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  BookmarkIcon,
  EllipsisHorizontalIcon,
  UserMinusIcon,
  UserPlusIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { format } from "date-fns";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import CreatePostDialog from "../components/Feed/CreatePost";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface User {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  followers: string[];
  following: string[];
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  image_url?: string;
  comments: Comment[];
  likes: Like[];
  user: User;
  bookmarked: boolean;
  repost_count: number;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
}

interface Like {
  id: string;
  user_id: string;
}

export default function Feed() {
  const [activeTab, setActiveTab] = useState("foryou");
  const [content, setContent] = useState("");
  const [editContent, setEditContent] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [showReportDialog, setShowReportDialog] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { user, isLoaded } = useUser();

const router = useRouter();

const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          id, content, created_at, user_id, image_url,
          comments(id, content, user_id, created_at),
          likes(id, user_id)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Post[];
    },
    enabled: isLoaded && !!user,
  });

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(fileName, file);
    if (uploadError) throw uploadError;
    return fileName;
  };

  const createPost = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

      let imagePath = null;
      if (selectedImage) {
        imagePath = await uploadImage(selectedImage);
      }

      const { error } = await supabase.from("posts").insert({
        content,
        user_id: userData?.id,
        image_url: imagePath,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setContent("");
      setSelectedImage(null);
      setImagePreview(null);
    },
  });

  const editPost = useMutation({
    mutationFn: async ({ postId, newContent }: { postId: string; newContent: string; }) => {
      const { error } = await supabase
        .from("posts")
        .update({ content: newContent })
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setEditContent(null);
    },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const toggleLike = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

      const { data: existingLike } = await supabase
        .from("likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", userData?.id)
        .single();

      if (existingLike) {
        await supabase.from("likes").delete().eq("id", existingLike.id);
      } else {
        await supabase.from("likes").insert({
          post_id: postId,
          user_id: userData?.id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const addComment = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string; }) => {
      if (!user) throw new Error("User not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

      const { error } = await supabase.from("comments").insert({
        content,
        post_id: postId,
        user_id: userData?.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setCommentContent({});
    },
  });

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleShare = async (post: Post) => {
    try {
      await navigator.share({
        title: "Check out this post!",
        text: post.content,
        url: window.location.href,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const toggleFollow = useMutation({
    mutationFn: async (targetUserId: string) => {
      const { data: userData } = await supabase
        .from("users")
        .select("following")
        .eq("clerk_id", user?.id)
        .single();

      const isFollowing = userData?.following?.includes(targetUserId);
      const newFollowing = isFollowing
        ? userData?.following?.filter((id: string) => id !== targetUserId) || []
        : [...(userData?.following || []), targetUserId];

      await supabase
        .from("users")
        .update({ following: newFollowing })
        .eq("clerk_id", user?.id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", "posts"] }),
  });

  const toggleBookmark = useMutation({
    mutationFn: async (postId: string) => {
      const { data: existing } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user?.id)
        .single();

      if (existing) {
        await supabase.from("bookmarks").delete().eq("id", existing.id);
      } else {
        await supabase.from("bookmarks").insert({
          post_id: postId,
          user_id: user?.id,
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });

  return (
    <div className="min-h-screen w-full overflow-x-hidden ml-14 text-white">
      <div className="fixed top-4 right-4">
        <CreatePostDialog />
      </div>
      <div>
        <h1 className="text-3xl ml-72 mt-3 font-bold mb-4">
          Welcome, {isLoaded && user ? user.firstName : "Guest"}
        </h1>
      </div>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex mb-6 bg-gray-700 rounded-xl overflow-hidden">
          <button
            onClick={() => setActiveTab("foryou")}
            className={`flex-1 py-3 ${
              activeTab === "foryou"
                ? "bg-blue-500 text-white"
                : "text-gray-300 hover:bg-gray-600"
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab("following")}
            className={`flex-1 py-3 ${
              activeTab === "following"
                ? "bg-blue-500 text-white"
                : "text-gray-300 hover:bg-gray-600"
            }`}
          >
            Following
          </button>
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : (
          posts?.map((post) => (
            <article
              key={post.id}
              className="bg-gray-700 rounded-xl p-6 mb-6 shadow-lg hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-start space-x-3">
                <Avatar>
                  <AvatarImage
                    src={post.user?.avatar_url || ""}
                    alt={post.user?.username || "Unknown"}
                  />
                  <span
                    className="cursor-pointer"
                    onClick={() =>
                      router.replace(`/profile/${post.user?.username || ""}`)
                    }
                  />
                </Avatar>

                <div className="flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-2">
                      <span
                        className="font-bold hover:underline cursor-pointer"
                        onClick={() =>
                          router.replace(`/profile/${post.user?.username}`)
                        }
                      >
                        {post.user?.full_name || "Unknown User"}
                      </span>
                      <span className="text-gray-400">
                        @{post.user?.username}
                      </span>
                      <span className="text-gray-400">·</span>
                      <time className="text-gray-400">
                        {format(new Date(post.created_at), "MMM d")}
                      </time>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <EllipsisHorizontalIcon className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {post.user_id === user?.id ? (
                          <>
                            <DropdownMenuItem
                              onClick={() => setEditContent(post.id)}
                            >
                              <PencilIcon className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deletePost.mutate(post.id)}
                              className="text-red-500"
                            >
                              <TrashIcon className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem
                              onClick={() => toggleFollow.mutate(post.user_id)}
                            >
                              {post.user?.followers?.includes(
                                user?.id ?? ""
                              ) ? (
                                <>
                                  <UserMinusIcon className="w-4 h-4 mr-2" />
                                  Unfollow
                                </>
                              ) : (
                                <>
                                  <UserPlusIcon className="w-4 h-4 mr-2" />
                                  Follow
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setShowReportDialog(true)}
                            >
                              <ExclamationCircleIcon className="w-4 h-4 mr-2" />
                              Report
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {editContent === post.id ? (
                    <div>
                      <textarea
                        value={post.content}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-gray-600 rounded-lg p-4 text-white placeholder-gray-400 border-none resize-none focus:ring-2 focus:ring-blue-500 min-h-[120px] focus:outline-none"
                      />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={() => setEditContent(null)}
                          className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() =>
                            editPost.mutate({
                              postId: post.id,
                              newContent: editContent,
                            })
                          }
                          className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-white whitespace-pre-wrap">
                      {post.content}
                    </div>
                  )}

                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Post content"
                      className="mt-4 rounded-lg w-full object-cover max-h-96"
                    />
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => toggleLike.mutate(post.id)}
                      className="flex items-center space-x-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      {post.likes.some((like) => like.user_id === user?.id) ? (
                        <HeartSolid className="w-6 h-6 text-red-500" />
                      ) : (
                        <HeartOutline className="w-6 h-6" />
                      )}
                      <span>{post.likes.length}</span>
                    </button>

                    <button
                      onClick={() =>
                        setShowComments((prev) => ({
                          ...prev,
                          [post.id]: !prev[post.id],
                        }))
                      }
                      className="flex items-center space-x-2 text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
                      <span>{post.comments.length}</span>
                    </button>

                    <button
                      onClick={() => handleShare(post)}
                      className="flex items-center space-x-2 text-gray-400 hover:text-green-500 transition-colors"
                    >
                      <ShareIcon className="w-6 h-6" />
                    </button>

                    <button
                      onClick={() => toggleBookmark.mutate(post.id)}
                      className="flex items-center space-x-2 text-gray-400 hover:text-yellow-500 transition-colors"
                    >
                      <BookmarkIcon
                        className={`w-6 h-6 ${
                          post.bookmarked ? "text-yellow-500 fill-current" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {showComments[post.id] && (
                    <div className="mt-4 space-y-4">
                      {post.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-gray-800 p-4 rounded-lg"
                        >
                          <div className="text-white">{comment.content}</div>
                        </div>
                      ))}
                      <div className="mt-4 flex space-x-3">
                        <input
                          type="text"
                          value={commentContent[post.id] || ""}
                          onChange={(e) =>
                            setCommentContent((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          placeholder="Add a comment..."
                          className="flex-1 bg-gray-600 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={() =>
                            addComment.mutate({
                              postId: post.id,
                              content: commentContent[post.id],
                            })
                          }
                          disabled={!commentContent[post.id]}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}





