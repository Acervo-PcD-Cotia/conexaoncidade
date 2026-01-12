import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Heart,
  Reply,
  MoreHorizontal,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  like_count: number;
  created_at: string;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  replies?: Comment[];
}

interface Member {
  user_id: string;
  profile?: {
    full_name: string | null;
  };
}

interface NestedCommentsProps {
  postId: string;
}

export function NestedComments({ postId }: NestedCommentsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionCursorPos, setMentionCursorPos] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch comments
  const { data: comments, isLoading } = useQuery({
    queryKey: ["post-comments", postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_comments")
        .select("*")
        .eq("post_id", postId)
        .eq("is_hidden", false)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch author profiles
      const authorIds = [...new Set(data.map((c) => c.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", authorIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      // Build nested structure
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      data.forEach((comment) => {
        commentMap.set(comment.id, {
          ...comment,
          author: profileMap.get(comment.author_id) || null,
          replies: [],
        });
      });

      data.forEach((comment) => {
        const commentWithAuthor = commentMap.get(comment.id)!;
        if (comment.parent_id && commentMap.has(comment.parent_id)) {
          commentMap.get(comment.parent_id)!.replies!.push(commentWithAuthor);
        } else {
          rootComments.push(commentWithAuthor);
        }
      });

      return rootComments;
    },
  });

  // Fetch members for mentions
  const { data: members } = useQuery({
    queryKey: ["community-members-mentions", mentionQuery],
    queryFn: async () => {
      const { data: membersData } = await supabase
        .from("community_members")
        .select("user_id")
        .not("access_granted_at", "is", null)
        .limit(10);

      if (!membersData?.length) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in(
          "id",
          membersData.map((m) => m.user_id)
        )
        .ilike("full_name", `%${mentionQuery}%`)
        .limit(5);

      return profiles?.map((p) => ({
        user_id: p.id,
        profile: { full_name: p.full_name },
      })) as Member[];
    },
    enabled: showMentions && mentionQuery.length > 0,
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async ({
      content,
      parentId,
    }: {
      content: string;
      parentId?: string;
    }) => {
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("community_comments").insert({
        post_id: postId,
        author_id: user.id,
        content,
        parent_id: parentId || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["community-posts"] });
      setNewComment("");
      setReplyingTo(null);
      setReplyContent("");
      toast({
        title: "Comentário enviado!",
        description: "Seu comentário foi publicado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    },
  });

  // Handle @ mention detection
  const handleTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    isReply = false
  ) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;

    if (isReply) {
      setReplyContent(value);
    } else {
      setNewComment(value);
    }

    // Check for @ mention
    const textBeforeCursor = value.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setShowMentions(true);
      setMentionQuery(mentionMatch[1]);
      setMentionCursorPos(cursorPos);
    } else {
      setShowMentions(false);
    }
  };

  // Insert mention
  const insertMention = (member: Member, isReply = false) => {
    const currentValue = isReply ? replyContent : newComment;
    const textBeforeMention = currentValue.substring(0, mentionCursorPos);
    const mentionStart = textBeforeMention.lastIndexOf("@");
    const textAfterMention = currentValue.substring(mentionCursorPos);

    const firstName = member.profile?.full_name?.split(" ")[0] || "usuário";
    const newValue =
      currentValue.substring(0, mentionStart) +
      `@${firstName} ` +
      textAfterMention;

    if (isReply) {
      setReplyContent(newValue);
    } else {
      setNewComment(newValue);
    }

    setShowMentions(false);
  };

  const handleSubmit = (parentId?: string) => {
    const content = parentId ? replyContent : newComment;
    if (content.trim()) {
      createCommentMutation.mutate({ content: content.trim(), parentId });
    }
  };

  const userInitials =
    user?.user_metadata?.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <div className="space-y-4 pt-4 border-t">
      <h4 className="font-semibold text-sm flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Comentários
        {comments?.length ? (
          <span className="text-muted-foreground">({comments.length})</span>
        ) : null}
      </h4>

      {/* New Comment Form */}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder="Escreva um comentário... Use @ para mencionar"
            value={newComment}
            onChange={(e) => handleTextChange(e, false)}
            rows={2}
            className="resize-none text-sm"
          />

          {/* Mentions dropdown */}
          {showMentions && members && members.length > 0 && (
            <div className="absolute z-10 left-0 mt-1 w-48 bg-popover border rounded-md shadow-lg">
              {members.map((member) => (
                <button
                  key={member.user_id}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                  onClick={() => insertMention(member, false)}
                >
                  @{member.profile?.full_name?.split(" ")[0] || "usuário"}
                </button>
              ))}
            </div>
          )}

          <Button
            size="sm"
            className="mt-2 gap-1"
            onClick={() => handleSubmit()}
            disabled={!newComment.trim() || createCommentMutation.isPending}
          >
            <Send className="h-3 w-3" />
            Enviar
          </Button>
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center text-sm text-muted-foreground py-4">
          Carregando comentários...
        </div>
      ) : !comments?.length ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhum comentário ainda. Seja o primeiro!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              handleTextChange={handleTextChange}
              handleSubmit={handleSubmit}
              showMentions={showMentions}
              members={members}
              insertMention={insertMention}
              isPending={createCommentMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  handleTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>, isReply: boolean) => void;
  handleSubmit: (parentId?: string) => void;
  showMentions: boolean;
  members?: Member[];
  insertMention: (member: Member, isReply: boolean) => void;
  isPending: boolean;
}

function CommentItem({
  comment,
  depth = 0,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  handleTextChange,
  handleSubmit,
  showMentions,
  members,
  insertMention,
  isPending,
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(true);
  const hasReplies = comment.replies && comment.replies.length > 0;

  const initials =
    comment.author?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  // Highlight @mentions in content
  const renderContent = (content: string) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        return (
          <span key={i} className="text-primary font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className={`${depth > 0 ? "ml-6 pl-4 border-l-2 border-muted" : ""}`}>
      <div className="flex gap-2">
        <Avatar className="h-7 w-7">
          <AvatarImage src={comment.author?.avatar_url || undefined} />
          <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="bg-muted/50 rounded-lg px-3 py-2">
            <p className="text-xs font-medium">
              {comment.author?.full_name || "Membro"}
            </p>
            <p className="text-sm whitespace-pre-wrap">
              {renderContent(comment.content)}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span>
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
            <button className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Heart className="h-3 w-3" />
              {comment.like_count > 0 && comment.like_count}
            </button>
            {depth < 2 && (
              <button
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                onClick={() =>
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                }
              >
                <Reply className="h-3 w-3" />
                Responder
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-2 flex gap-2">
              <Textarea
                placeholder={`Responder a ${comment.author?.full_name?.split(" ")[0] || "usuário"}...`}
                value={replyContent}
                onChange={(e) => handleTextChange(e, true)}
                rows={2}
                className="resize-none text-sm flex-1"
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleSubmit(comment.id)}
                  disabled={!replyContent.trim() || isPending}
                >
                  <Send className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent("");
                  }}
                >
                  ✕
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies */}
      {hasReplies && (
        <div className="mt-2">
          <button
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-9"
            onClick={() => setShowReplies(!showReplies)}
          >
            {showReplies ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            {comment.replies!.length} resposta{comment.replies!.length > 1 ? "s" : ""}
          </button>
          {showReplies && (
            <div className="mt-2 space-y-2">
              {comment.replies!.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  handleTextChange={handleTextChange}
                  handleSubmit={handleSubmit}
                  showMentions={showMentions}
                  members={members}
                  insertMention={insertMention}
                  isPending={isPending}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
