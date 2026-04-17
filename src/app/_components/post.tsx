"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

export function LatestPost() {
  const [latestPost] = api.post.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest post</CardTitle>
        <CardDescription>
          {latestPost
            ? `Most recent entry: ${latestPost.name}`
            : "You have no posts yet."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            createPost.mutate({ name });
          }}
        >
          <Input
            onChange={(e) => setName(e.target.value)}
            placeholder="Create a new post"
            value={name}
          />
          <Button disabled={createPost.isPending} type="submit">
            {createPost.isPending ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
