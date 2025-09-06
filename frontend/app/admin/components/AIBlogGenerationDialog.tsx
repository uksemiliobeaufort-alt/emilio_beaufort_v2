"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Lightbulb, Copy, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";

import { generateBlogPost, generateBlogIdeas, BlogGenerationRequest, GeneratedBlogContent } from "@/lib/gemini";
import TipTapEditor from "./TipTapEditor";

interface AIBlogGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBlogGenerated: (blogData: {
    title: string;
    content: string;
    keywords: string[];
    tags: string[];
    images?: string[];
  }) => void;
}


export default function AIBlogGenerationDialog({
  open,
  onOpenChange,
  onBlogGenerated
}: AIBlogGenerationDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);
  const [blogIdeas, setBlogIdeas] = useState<string[]>([]);
  const [showIdeas, setShowIdeas] = useState(false);

  // Form state
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<"professional" | "casual" | "luxury" | "educational">("luxury");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [includeImages, setIncludeImages] = useState(false);

  // Generated content state
  const [generatedContent, setGeneratedContent] = useState<GeneratedBlogContent | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const isGeneratingIdeasRef = useRef(false);
  const isGeneratingBlogRef = useRef(false);
  const operationIdRef = useRef(0);
  const lastCallTimeRef = useRef(0);

  const handleGenerateIdeas = async () => {
    // Prevent rapid successive calls (debounce)
    const now = Date.now();
    if (now - lastCallTimeRef.current < 1000) {
      return;
    }
    lastCallTimeRef.current = now;
    
    // Prevent multiple calls while loading
    if (isLoadingIdeas || isGeneratingIdeasRef.current) return;
    
    const currentOperationId = ++operationIdRef.current;
    isGeneratingIdeasRef.current = true;
    setIsLoadingIdeas(true);
    
    try {
      const ideas = await generateBlogIdeas();
      // Only update state if this is still the current operation
      if (currentOperationId === operationIdRef.current) {
        setBlogIdeas(ideas);
        setShowIdeas(true);
      }
    } catch (error) {
      console.error("Error generating ideas:", error);
    } finally {
      if (currentOperationId === operationIdRef.current) {
        setIsLoadingIdeas(false);
        isGeneratingIdeasRef.current = false;
      }
    }
  };

  const handleSelectIdea = (idea: string) => {
    setTopic(idea);
    setShowIdeas(false);
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleGenerateBlog = async () => {
    if (!topic.trim()) {
      return;
    }

    // Prevent rapid successive calls (debounce)
    const now = Date.now();
    if (now - lastCallTimeRef.current < 1000) {
      return;
    }
    lastCallTimeRef.current = now;

    // Prevent multiple calls while generating
    if (isGenerating || isGeneratingBlogRef.current) return;

    const currentOperationId = ++operationIdRef.current;
    isGeneratingBlogRef.current = true;
    setIsGenerating(true);
    
    try {
      const request: BlogGenerationRequest = {
        topic: topic.trim(),
        tone,
        length,
        keywords: keywords.length > 0 ? keywords : undefined,
        targetAudience: targetAudience.trim() || undefined,
        includeImages,
      };

      const generated = await generateBlogPost(request);
      // Only update state if this is still the current operation
      if (currentOperationId === operationIdRef.current) {
        setGeneratedContent(generated);
        setShowPreview(true);
      }
    } catch (error) {
      console.error("Error generating blog:", error);
    } finally {
      if (currentOperationId === operationIdRef.current) {
        setIsGenerating(false);
        isGeneratingBlogRef.current = false;
      }
    }
  };

  const handleUseGeneratedContent = () => {
    if (generatedContent) {
      onBlogGenerated({
        title: generatedContent.title,
        content: generatedContent.content,
        keywords: generatedContent.keywords,
        tags: generatedContent.tags,
        images: (generatedContent.images || []).map(i => i.url),
      });
      onOpenChange(false);
      resetForm();
    }
  };

  const handleCopyContent = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.content);
    }
  };

  const resetForm = () => {
    setTopic("");
    setTone("luxury");
    setLength("medium");
    setKeywords([]);
    setKeywordInput("");
    setTargetAudience("");
    setGeneratedContent(null);
    setShowPreview(false);
    setShowIdeas(false);
    setBlogIdeas([]);
  };

  useEffect(() => {
    if (!open) {
      resetForm();
      // Reset refs when dialog closes
      isGeneratingIdeasRef.current = false;
      isGeneratingBlogRef.current = false;
    }
  }, [open]);

  // Cleanup effect to reset refs on unmount
  useEffect(() => {
    return () => {
      isGeneratingIdeasRef.current = false;
      isGeneratingBlogRef.current = false;
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            AI Blog Post Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!showPreview ? (
            // Generation Form
            (<div className="space-y-6">
              {/* Topic Input */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Blog Topic</Label>
                <div className="flex gap-2">
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter the topic for your blog post"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateIdeas}
                    disabled={isLoadingIdeas}
                    className="whitespace-nowrap"
                  >
                    {isLoadingIdeas ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Lightbulb className="h-4 w-4" />
                    )}
                    {isLoadingIdeas ? "Generating..." : "Get Ideas"}
                  </Button>
                </div>
              </div>
              {/* Blog Ideas */}
              {showIdeas && blogIdeas.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-base font-medium">Suggested Topics</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                    {blogIdeas.map((idea, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectIdea(idea)}
                        className="text-left p-2 hover:bg-gray-100 rounded text-sm transition-colors"
                      >
                        {idea}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Tone and Length */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Tone</Label>
                  <Select value={tone} onValueChange={(value: any) => setTone(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="luxury">Luxury & Premium</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual & Friendly</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Length</Label>
                  <Select value={length} onValueChange={(value: any) => setLength(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (300-500 words)</SelectItem>
                      <SelectItem value="medium">Medium (800-1200 words)</SelectItem>
                      <SelectItem value="long">Long (1500-2000 words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Keywords */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Keywords (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddKeyword();
                      }
                    }}
                    placeholder="Add keywords and press Enter"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddKeyword}
                    disabled={!keywordInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {keywords.map((kw, idx) => (
                      <span key={idx} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                        {kw}
                        <button
                          onClick={() => handleRemoveKeyword(idx)}
                          className="ml-1 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {/* Target Audience */}
              <div className="space-y-2">
                <Label className="text-base font-medium">Target Audience (Optional)</Label>
                <Input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Women aged 25-40, beauty enthusiasts, professionals"
                />
              </div>
              {/* Images Toggle */}
              <div className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <Label className="text-base font-medium">Include related images</Label>
                  <div className="text-xs text-muted-foreground">Generate 1-3 images via Gemini (auto-compressed to WebP &lt;1MB)</div>
                </div>
                <Switch checked={includeImages} onCheckedChange={setIncludeImages} />
              </div>
              {/* Generate Button */}
              <Button
                onClick={handleGenerateBlog}
                disabled={isGenerating || !topic.trim()}
                className="w-full h-12 text-base bg-purple-600 text-white hover:bg-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating Blog Post...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Blog Post
                  </>
                )}
              </Button>
            </div>)
          ) : (
            // Preview Generated Content
            (<div className="space-y-6">
              {generatedContent && (
                <>
                  {/* Generated Title */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Generated Title</Label>
                    <Input
                      value={generatedContent.title}
                      onChange={(e) => setGeneratedContent({
                        ...generatedContent,
                        title: e.target.value
                      })}
                      className="text-lg font-semibold"
                    />
                  </div>

                  {/* Generated Content Preview */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Generated Content</Label>
                    <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                      <div
                        dangerouslySetInnerHTML={{ __html: generatedContent.content }}
                        className="prose prose-sm max-w-none"
                      />
                    </div>
                  </div>

                  {/* Images Preview */}
                  {generatedContent.images && generatedContent.images.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Related Images</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {generatedContent.images.map((img, idx) => (
                          <a key={idx} href={img.source || img.url} target="_blank" rel="noreferrer">
                            <img src={img.url} alt={img.alt} className="w-full h-32 object-cover rounded" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Blog Size & Compression Info */}
                  {generatedContent.metadata && (
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <Label className="text-base font-medium mb-2 block">Blog Information</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Total Size:</span>{' '}
                          <span className={`${generatedContent.metadata.estimatedSize > 1024 * 1024 ? 'text-red-600' : 'text-green-600'}`}>
                            {(generatedContent.metadata.estimatedSize / 1024).toFixed(2)} KB
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Images:</span>{' '}
                          <span>{generatedContent.metadata.imageCount} images</span>
                        </div>
                        <div>
                          <span className="font-medium">Compression:</span>{' '}
                          <span className={generatedContent.metadata.compressionApplied ? 'text-green-600' : 'text-gray-600'}>
                            {generatedContent.metadata.compressionApplied ? '✓ WebP compressed' : 'No compression'}
                          </span>
                        </div>
                      </div>
                      {generatedContent.metadata.estimatedSize > 1024 * 1024 && (
                        <div className="mt-2 text-xs text-red-600">
                          ⚠️ Blog exceeds 1MB Firebase limit. Consider reducing content or images.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Keywords and Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Keywords</Label>
                      <div className="flex flex-wrap gap-2">
                        {generatedContent.keywords.map((kw, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Tags</Label>
                      <div className="flex flex-wrap gap-2">
                        {generatedContent.tags.map((tag, idx) => (
                          <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleUseGeneratedContent}
                      className="flex-1 bg-purple-600 text-white hover:bg-purple-700"
                    >
                      Use This Content
                    </Button>
                    <Button
                      onClick={handleCopyContent}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Content
                    </Button>
                    <Button
                      onClick={() => setShowPreview(false)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Generate New
                    </Button>
                  </div>
                </>
              )}
            </div>)
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
