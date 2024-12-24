// import { useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

// interface Post {
//   id: string;
//   content: string;
//   created_at: string;
//   user_id: string;
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
//   const [commentContent, setCommentContent] = useState<Record<string, string>>(
//     {}
//   );
//   const { user, isLoaded } = useUser();
//   const queryClient = useQueryClient();

//   const { data: posts, isLoading } = useQuery({
//     queryKey: ["posts"],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("posts")
//         .select(
//           `
//           id,
//           content,
//           created_at,
//           user_id,
//           comments (
//             id,
//             content,
//             user_id,
//             created_at
//           ),
//           likes (
//             id,
//             user_id
//           )
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
//       const { data: userData, error: userError } = await supabase
//         .from("users")
//         .select("id")
//         .eq("clerk_id", user!.id)
//         .single();

//       if (userError) throw userError;

//       const { error: postError } = await supabase
//         .from("posts")
//         .insert({ content, user_id: userData.id });

//       if (postError) throw postError;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["posts"] });
//       setContent("");
//     },
//   });

//   const createComment = useMutation({
//     mutationFn: async ({
//       postId,
//       content,
//     }: {
//       postId: string;
//       content: string;
//     }) => {
//       const { data: userData, error: userError } = await supabase
//         .from("users")
//         .select("id")
//         .eq("clerk_id", user!.id)
//         .single();

//       if (userError) throw userError;

//       const { error: commentError } = await supabase
//         .from("comments")
//         .insert({ content, post_id: postId, user_id: userData.id });

//       if (commentError) throw commentError;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["posts"] });
//       setCommentContent({});
//     },
//   });

//   const toggleLike = useMutation({
//     mutationFn: async (postId: string) => {
//       const { data: userData, error: userError } = await supabase
//         .from("users")
//         .select("id")
//         .eq("clerk_id", user!.id)
//         .single();

//       if (userError) throw userError;

//       const { error: likeError } = await supabase
//         .from("likes")
//         .upsert([{ post_id: postId, user_id: userData.id }]);

//       if (likeError) throw likeError;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["posts"] });
//     },
//   });

//   if (!isLoaded) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-2xl mx-auto p-4 space-y-6">
//         {/* Create Post Card */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
//           <div className="flex items-start space-x-4">
//             <img
//               src={user?.imageUrl || "/api/placeholder/32/32"}
//               alt="Profile"
//               className="w-10 h-10 rounded-full"
//             />
//             <div className="flex-1">
//               <textarea
//                 value={content}
//                 onChange={(e) => setContent(e.target.value)}
//                 placeholder="What's on your mind?"
//                 className="w-full p-3 border border-gray-200 text-black rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] bg-gray-50"
//               />
//               <div className="mt-3 flex justify-end">
//                 <button
//                   onClick={() => createPost.mutate()}
//                   disabled={!content.trim() || createPost.isPending}
//                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {createPost.isPending ? (
//                     <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
//                   ) : (
//                     <svg
//                       className="h-4 w-4 mr-2"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
//                       />
//                     </svg>
//                   )}
//                   Post
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Posts Feed */}
//         {isLoading ? (
//           <div className="space-y-4">
//             {[...Array(3)].map((_, i) => (
//               <div
//                 key={i}
//                 className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse"
//               >
//                 <div className="flex items-center space-x-4">
//                   <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
//                   <div className="flex-1">
//                     <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
//                     <div className="h-4 bg-gray-200 rounded w-1/2"></div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="space-y-6">
//             {posts?.map((post) => (
//               <div
//                 key={post.id}
//                 className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
//               >
//                 {/* Post Header */}
//                 <div className="p-4 border-b border-gray-100">
//                   <div className="flex items-center space-x-3">
//                     <img
//                       src="/api/placeholder/32/32"
//                       alt="User"
//                       className="w-10 h-10 rounded-full bg-gray-200"
//                     />
//                     <div>
//                       <p className="font-medium text-gray-900">User</p>
//                       <p className="text-sm text-gray-500">
//                         {new Date(post.created_at).toLocaleDateString(
//                           undefined,
//                           {
//                             month: "short",
//                             day: "numeric",
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           }
//                         )}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Post Content */}
//                 <div className="p-4">
//                   <p className="text-gray-900 whitespace-pre-wrap">
//                     {post.content}
//                   </p>
//                 </div>

//                 {/* Post Actions */}
//                 <div className="flex items-center px-4 py-3 border-t border-gray-100">
//                   <button
//                     onClick={() => toggleLike.mutate(post.id)}
//                     className={`flex items-center space-x-2 ${
//                       post.likes.some((like) => like.user_id === user?.id)
//                         ? "text-red-500"
//                         : "text-gray-500 hover:text-red-500"
//                     } transition-colors`}
//                   >
//                     <svg
//                       className={`h-6 w-6 ${
//                         post.likes.some((like) => like.user_id === user?.id)
//                           ? "fill-current"
//                           : "stroke-2"
//                       }`}
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
//                       />
//                     </svg>
//                     <span>{post.likes.length}</span>
//                   </button>

//                   <div className="flex items-center space-x-2 ml-6 text-gray-500">
//                     <svg
//                       className="h-6 w-6"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
//                       />
//                     </svg>
//                     <span>{post.comments.length}</span>
//                   </div>
//                 </div>

//                 {/* Comments Section */}
//                 <div className="bg-gray-50 p-4 space-y-4">
//                   {post.comments.map((comment) => (
//                     <div
//                       key={comment.id}
//                       className="flex items-start space-x-3"
//                     >
//                       <img
//                         src="/api/placeholder/24/24"
//                         alt="Commenter"
//                         className="w-8 h-8 rounded-full bg-gray-200"
//                       />
//                       <div className="flex-1 bg-white rounded-lg p-3 shadow-sm">
//                         <p className="text-sm text-gray-900">
//                           {comment.content}
//                         </p>
//                         <p className="text-xs text-gray-500 mt-1">
//                           {new Date(comment.created_at).toLocaleDateString()}
//                         </p>
//                       </div>
//                     </div>
//                   ))}

//                   {/* Add Comment */}
//                   <div className="flex items-start space-x-3 mt-4">
//                     <img
//                       src={user?.imageUrl || "/api/placeholder/24/24"}
//                       alt="Profile"
//                       className="w-8 h-8 rounded-full"
//                     />
//                     <div className="flex-1 relative">
//                       <input
//                         type="text"
//                         value={commentContent[post.id] || ""}
//                         onChange={(e) =>
//                           setCommentContent((prev) => ({
//                             ...prev,
//                             [post.id]: e.target.value,
//                           }))
//                         }
//                         placeholder="Write a comment..."
//                         className="w-full px-4 py-2 text-black border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
//                       />
//                       <button
//                         onClick={() => {
//                           if (commentContent[post.id]?.trim()) {
//                             createComment.mutate({
//                               postId: post.id,
//                               content: commentContent[post.id],
//                             });
//                           }
//                         }}
//                         disabled={
//                           !commentContent[post.id]?.trim() ||
//                           createComment.isPending
//                         }
//                         className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600 disabled:opacity-50"
//                       >
//                         <svg
//                           className="h-6 w-6"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
//                           />
//                         </svg>
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";

import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import {
  HeartIcon as HeartOutline,
  ChatBubbleOvalLeftEllipsisIcon,
  ShareIcon,
  TrashIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  image_url?: string;
  comments: Comment[];
  likes: Like[];
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
  const [content, setContent] = useState("");
  const [commentContent, setCommentContent] = useState<Record<string, string>>(
    {}
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { user, isLoaded } = useUser();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          id, content, created_at, user_id, image_url,
          comments(id, content, user_id, created_at),
          likes(id, user_id)
        `
        )
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
    mutationFn: async ({
      postId,
      content,
    }: {
      postId: string;
      content: string;
    }) => {
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Create Post */}
        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <img
              src={user?.imageUrl}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 space-y-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?"
                className="w-full bg-gray-700 rounded-lg p-3 text-white placeholder-gray-400 border-none resize-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
              {imagePreview && (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-96 w-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedImage(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-gray-900 rounded-full hover:bg-gray-800"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between">
                <input
                  type="file"
                  accept="image/*"
                  ref={imageInputRef}
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <PhotoIcon className="w-6 h-6 text-blue-400" />
                </button>
                <button
                  onClick={() => createPost.mutate()}
                  disabled={
                    (!content.trim() && !selectedImage) || createPost.isPending
                  }
                  className="bg-blue-500 px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createPost.isPending ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts?.map((post) => (
            <div
              key={post.id}
              className="bg-gray-800 rounded-xl p-4 space-y-4 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={user?.imageUrl}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold">{user?.fullName}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(post.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <p className="text-lg">{post.content}</p>

              {post.image_url && (
                <img
                  src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/post-images/${post.image_url}`}
                  alt="Post"
                  className="rounded-xl max-h-96 w-full object-cover"
                />
              )}

              <div className="flex items-center space-x-6 pt-2">
                <button
                  onClick={() => toggleLike.mutate(post.id)}
                  className="flex items-center space-x-2 group"
                >
                  {post.likes.some((like) => like.user_id === user?.id) ? (
                    <HeartSolid className="w-6 h-6 text-pink-500" />
                  ) : (
                    <HeartOutline className="w-6 h-6 text-gray-400 group-hover:text-pink-500 transition-colors" />
                  )}
                  <span className="text-sm text-gray-400 group-hover:text-pink-500">
                    {post.likes.length}
                  </span>
                </button>

                <button
                  onClick={() =>
                    setShowComments({
                      ...showComments,
                      [post.id]: !showComments[post.id],
                    })
                  }
                  className="flex items-center space-x-2 group"
                >
                  <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                  <span className="text-sm text-gray-400 group-hover:text-blue-500">
                    {post.comments.length}
                  </span>
                </button>

                <button
                  onClick={() => handleShare(post)}
                  className="flex items-center space-x-2 group"
                >
                  <ShareIcon className="w-6 h-6 text-gray-400 group-hover:text-green-500" />
                </button>
              </div>

              {showComments[post.id] && (
                <div className="space-y-4 mt-4 border-t border-gray-700 pt-4">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <img
                        src={user?.imageUrl}
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1 bg-gray-700 rounded-lg p-3">
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex space-x-3">
                    <img
                      src={user?.imageUrl}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={commentContent[post.id] || ""}
                        onChange={(e) =>
                          setCommentContent({
                            ...commentContent,
                            [post.id]: e.target.value,
                          })
                        }
                        placeholder="Add a comment..."
                        className="w-full bg-gray-700 rounded-full py-2 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          if (commentContent[post.id]?.trim()) {
                            addComment.mutate({
                              postId: post.id,
                              content: commentContent[post.id],
                            });
                          }
                        }}
                        disabled={
                          !commentContent[post.id]?.trim() ||
                          addComment.isPending
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-400"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}