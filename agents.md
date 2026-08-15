# About/goals

This is a basic inventory management system used for clubs and potentially the idea in the future to have it support multiple clubs in our school's super fab lab so that anybody can use a centralized inventory management system. The main goal with this system is ease of use - for this reason we have sign in with discord (all clubs use it) and we are also limiting the amount of things visible to the user to make the core things that everybody would need to do simple and easy to access.

# Code stuff

## This is a basic t3 stack app. There are a few basic principles here to keep in mind:

- UI elements are primarily built on shadcn/ui. If there is a shadcn component for this you should not try to make your own. If you need to add a new component use the pnpm dlx command in the shadcn docs for it.
- The code for shadcn components (anything in the /components/ui folder) is not to be edited directly unless there is a VERY good reason for it. Other parts in the code rely on this and we don't want to stray from original shadcn code if we need to update the components. If in the rare case where there is no workaround and edits are directly made they should be documented in the file.
- The /components folder is only for components installed such as from shadcn or tiptap. Anything custom belongs in `/src/app/_components`, or if it's only going to ever be used in a specific route `/src/app/<route>/_components`.
- Because we are using shadcn, 90% of the point is to make styling consistent and not have the code cluttered with tailwind classes. The classes used should be limited to layout except for places where the design of something isn't in the scope of a normal shadcn component.
- Keep changes limited to the user's intent, and try to not propose drastic complex code changes when it can be done much simpler. This doesn't mean sacrifice everything for purely optimizing lines of code; the point here is that we strongly prefer to do things right and cut down on technical debt. If that means more code that is perfectly fine; however from practice for day to day tasks it usually does not.
- Do not make db migrations unless everything that is happening in the current PR is finished. Usually if the user asks to make a change it is only a part of the whole feature they are working on, so if you make a migration you are adding unnecessary bloat because there will be other changes later.

## Additionally when running/testing code:

- Do not spin up a dev server or try to make a new build. The user will almost certainly already have one running. If you try to make a build it will completely mess up the running dev server because they both output to .next folder so do not do that if one is running.
- Do not self run custom commands when there is a pnpm command defined in the `package.json`. This should always be preferred because there is sometimes things specific to the project in there that will be missed if you don't use the pnpm command.

# Other

If you run into something that was either misleading in this file that misguided you, let the user know why you were lead that way from this file so it can be fixed in the future.
