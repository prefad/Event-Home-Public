"use client";

const posts = [
  { title: "Welcome to the Event!", body: "Create offer codes that can be used by entering som...", date: "May 9, 2023 at 4:35 PM", author: "John Cena", unread: true },
  { title: "Welcome to the Event!", body: "Create offer codes that can be used by entering som...", date: "May 9, 2023 at 4:35 PM", author: "John Cena", unread: true },
  { title: "Welcome to the Event!", body: "Create offer codes that can be used by entering som...", date: "May 9, 2023 at 4:35 PM", author: "John Cena", unread: false },
];

export default function BulletinBoard() {
  return (
    <div className="bg-white border border-border-DEFAULT rounded-lg overflow-hidden">
      <div className="border-b border-border-DEFAULT p-4">
        <h3 className="text-base font-medium text-black">Bulletin Board</h3>
      </div>
      {posts.map((post, i) => (
        <div
          key={i}
          className={`flex border-b border-border-subdued last:border-b-0 ${
            post.unread ? "bg-brand-primary-ultra-light" : ""
          }`}
        >
          {post.unread && (
            <div className="w-1 bg-brand-primary flex-shrink-0" />
          )}
          {!post.unread && (
            <div className="w-1.5 flex-shrink-0" />
          )}
          <div className="flex-1 px-4 py-6">
            <p className="text-base font-medium text-black leading-tight">{post.title}</p>
            <p className="text-sm text-text-muted mt-0.5 line-clamp-2">{post.body}</p>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs font-medium text-text-muted">{post.date}</span>
              <span className="text-xs font-medium text-text-muted">{post.author}</span>
            </div>
          </div>
        </div>
      ))}
      <div className="border-t border-border-DEFAULT">
        <button className="w-full py-4 text-sm font-medium text-brand-primary text-center hover:bg-gray-50">
          View all posts
        </button>
      </div>
    </div>
  );
}
