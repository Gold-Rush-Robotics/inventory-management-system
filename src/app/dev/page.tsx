"use client";

import { LatestPost } from "@/app/_components/post";
import { useRequireLogin } from "@/app/_components/require-login";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/server/better-auth/client";
import { api } from "@/trpc/react";
import { ArrowRight, Boxes, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { Typography } from "../_components/typography";

export default function Home() {
  const { signOut } = useRequireLogin();
  const hello = api.post.hello.useQuery({ text: "from tRPC" });
  const session = authClient.useSession();
  const userName = session.data?.user?.name ?? "there";

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-16">
        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
          <Card>
            <CardHeader className="flex flex-col gap-2">
              <Badge variant="outline">Inventory Management System</Badge>
              <CardTitle>
                Replace the starter page with a real app front door.
              </CardTitle>
              <CardDescription>
                Built with shadcn components, better-auth, Prisma, and tRPC so
                the homepage feels like product UI instead of scaffold output.
              </CardDescription>
              <CardAction className="hidden lg:block">
                <Badge>Authenticated</Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-3">
                <form>
                  <Button formAction={signOut} type="submit" size="lg">
                    Sign out
                  </Button>
                </form>

                <Link
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                  })}
                  href="https://ui.shadcn.com/docs"
                  target="_blank"
                >
                  Browse shadcn docs
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Card size="sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Boxes className="size-4" />
                      Inventory
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Typography variant="muted">
                      Organize stock operations behind a calmer landing page.
                    </Typography>
                  </CardContent>
                </Card>
                <Card size="sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="size-4" />
                      Auth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Typography variant="muted">
                      Present the homepage as a signed-in application surface.
                    </Typography>
                  </CardContent>
                </Card>
                <Card size="sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="size-4" />
                      Typed APIs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Typography variant="muted">
                      Preserve the working tRPC wiring and signed-in sample
                      flow.
                    </Typography>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{`Welcome back, ${userName}`}</CardTitle>
              <CardDescription>
                {hello.data?.greeting ?? "Loading tRPC query..."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="flex items-center justify-between border-b pb-3">
                <Typography as="span" variant="small">
                  Authentication
                </Typography>
                <Badge>Signed in</Badge>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <Typography as="span" variant="small">
                  Database
                </Typography>
                <Badge variant="outline">Prisma ready</Badge>
              </div>
              <div className="flex items-center justify-between">
                <Typography as="span" variant="small">
                  API layer
                </Typography>
                <Badge variant="outline">tRPC online</Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Link
                className={buttonVariants({
                  variant: "link",
                  className: "h-auto p-0",
                })}
                href="https://create.t3.gg/en/introduction"
                target="_blank"
              >
                Project stack overview
                <ArrowRight className="size-4" />
              </Link>
            </CardFooter>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Ready for your inventory workflows</CardTitle>
              <CardDescription>
                The starter links are gone in favor of app-facing content built
                with the shadcn registry components already configured in this
                repo.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="border px-4 py-3">
                <Typography variant="muted">
                  Replace these cards with inventory KPIs, low-stock alerts, or
                  recent purchase activity next.
                </Typography>
              </div>
              <div className="border px-4 py-3">
                <Typography variant="muted">
                  Keep using the same `Card`, `Badge`, `Input`, and `Button`
                  primitives for future dashboard sections.
                </Typography>
              </div>
            </CardContent>
          </Card>

          <LatestPost />
        </section>
      </div>
    </main>
  );
}
