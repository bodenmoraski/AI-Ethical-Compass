import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Perspective } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest, getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getRelativeTimeString } from "@/lib/scenarios";

interface PerspectiveCardProps {
  perspective: Perspective;
  scenarioId: number;
}

const PerspectiveCard = ({ perspective, scenarioId }: PerspectiveCardProps) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replies, setReplies] = useState<Perspective[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loading, setLoading] = useState({
    like: false,
    reply: false,
    loadingReplies: false
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleLike = async () => {
    if (loading.like) return;
    
    setLoading((prev) => ({ ...prev, like: true }));
    try {
      await apiRequest(
        "POST",
        `/api/perspectives/${perspective.id}/like`
      );
      
      // Update local perspective data
      queryClient.invalidateQueries({ 
        queryKey: [`/api/scenarios/${scenarioId}/perspectives`] 
      });
      
      toast({
        title: "Thanks for your feedback!",
        description: "You liked this perspective."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like this perspective. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading((prev) => ({ ...prev, like: false }));
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading.reply || !replyContent.trim()) return;
    
    setLoading((prev) => ({ ...prev, reply: true }));
    try {
      const response = await apiRequest(
        "POST",
        "/api/perspectives",
        {
          scenarioId,
          content: replyContent,
          parentId: perspective.id
        }
      );
      
      const newReply = await response.json();
      
      // Update replies if they're being shown
      if (showReplies) {
        setReplies((prev) => [...prev, newReply]);
      } else {
        setShowReplies(true);
        await loadReplies();
      }
      
      // Clear form
      setReplyContent("");
      setShowReplyForm(false);
      
      toast({
        title: "Reply submitted",
        description: "Your reply has been added to the discussion."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your reply. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading((prev) => ({ ...prev, reply: false }));
    }
  };

  const loadReplies = async () => {
    if (loading.loadingReplies) return;
    
    setLoading((prev) => ({ ...prev, loadingReplies: true }));
    try {
      const response = await fetch(`/api/perspectives/${perspective.id}/replies`, {
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error("Failed to load replies");
      }
      
      const fetchedReplies = await response.json();
      setReplies(fetchedReplies);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load replies. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading((prev) => ({ ...prev, loadingReplies: false }));
    }
  };

  const toggleReplies = async () => {
    if (!showReplies && replies.length === 0) {
      await loadReplies();
    }
    setShowReplies(!showReplies);
  };

  return (
    <Card className="border-neutral-200 shadow-sm">
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Perspective content */}
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium">
                  {perspective.authorName?.[0] || "A"}
                </div>
                <div>
                  <p className="font-medium">{perspective.authorName || "Anonymous"}</p>
                  <p className="text-xs text-neutral-500">
                    {getRelativeTimeString(new Date(perspective.createdAt))}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-neutral-500 hover:text-indigo-600"
                  onClick={handleLike}
                  disabled={loading.like}
                >
                  <span className="material-icons text-base mr-1">
                    favorite_border
                  </span>
                  {perspective.likes || 0}
                </Button>
              </div>
            </div>
            
            <div className="mt-2 text-neutral-800">
              <p>{perspective.content}</p>
            </div>
          </div>
          
          {/* Reply actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-neutral-600 hover:text-indigo-600"
              onClick={() => setShowReplyForm(!showReplyForm)}
            >
              <span className="material-icons text-base mr-1">reply</span>
              Reply
            </Button>
            
            {/* Show reply button if we have replies */}
            {replies.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-neutral-600 hover:text-indigo-600"
                onClick={toggleReplies}
              >
                <span className="material-icons text-base mr-1">
                  {showReplies ? "expand_less" : "expand_more"}
                </span>
                {showReplies ? "Hide replies" : `View replies (${replies.length})`}
              </Button>
            )}
          </div>
          
          {/* Reply form */}
          {showReplyForm && (
            <div className="mt-3 pl-4 border-l-2 border-indigo-100">
              <form onSubmit={handleReply} className="space-y-3">
                <Textarea
                  placeholder="Share your perspective on this comment..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px] resize-none border-neutral-300"
                  required
                />
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={loading.reply || !replyContent.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    size="sm"
                  >
                    {loading.reply ? "Submitting..." : "Submit Reply"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowReplyForm(false)}
                    size="sm"
                    className="border-neutral-300"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
          
          {/* Replies section */}
          {showReplies && (
            <div className="mt-2 space-y-3 pl-6 border-l-2 border-indigo-100">
              {loading.loadingReplies ? (
                <p className="text-neutral-500 text-sm animate-pulse">
                  Loading replies...
                </p>
              ) : replies.length > 0 ? (
                replies.map((reply) => (
                  <div key={reply.id} className="pt-3 first:pt-0">
                    <div className="flex items-start gap-2">
                      <div className="h-6 w-6 bg-blue-50 rounded-full flex items-center justify-center text-blue-700 text-xs">
                        {reply.authorName?.[0] || "A"}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-medium">
                            {reply.authorName || "Anonymous"}
                            <span className="text-xs text-neutral-500 font-normal ml-2">
                              {getRelativeTimeString(new Date(reply.createdAt))}
                            </span>
                          </p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-neutral-500 hover:text-indigo-600 h-6 px-2"
                            onClick={async () => {
                              await apiRequest(
                                "POST",
                                `/api/perspectives/${reply.id}/like`
                              );
                              // Update local data
                              setReplies(replies.map(r => 
                                r.id === reply.id ? {...r, likes: (r.likes || 0) + 1} : r
                              ));
                            }}
                          >
                            <span className="material-icons text-sm mr-1">
                              favorite_border
                            </span>
                            {reply.likes || 0}
                          </Button>
                        </div>
                        <p className="text-sm text-neutral-800 mt-1">{reply.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-sm">
                  No replies yet. Be the first to reply!
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerspectiveCard;