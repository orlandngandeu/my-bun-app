import { Database } from "bun:sqlite";
import type { Post } from "./types.ts";

const db = new Database("posts.db");
db.run(`
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

Bun.serve({
	routes: {
		"/api/posts": {
			GET: () => {
				const posts = db.query("SELECT * FROM posts").all();
				return Response.json(posts);
			},

			// Create post
			POST: async (req) => {
				const body = (await req.json()) as Omit<Post, "id" | "created_at">;

				if (
					typeof body !== "object" ||
					body === null ||
					typeof body.title !== "string" ||
					typeof body.content !== "string"
				) {
					return new Response("Invalid data", { status: 400 });
				}

				const post: Omit<Post, "id" | "created_at"> = body;
				const id = crypto.randomUUID();

				db.query(
					`INSERT INTO posts (id, title, content, created_at)
           VALUES (?, ?, ?, ?)`,
				).run(id, post.title, post.content, new Date().toISOString());

				return Response.json({ id, ...post }, { status: 201 });
			},
		},

		// Get post by ID
		"/api/posts/:id": (req) => {
			const post = db
				.query("SELECT * FROM posts WHERE id = ?")
				.get(req.params.id);

			if (!post) {
				return new Response("Not Found", { status: 404 });
			}

			return Response.json(post);
		},
	},

	error(error) {
		console.error(error);
		return new Response("Internal Server Error", { status: 500 });
	},
});
