const modelsInterface = [
    {
        "name": "User",
        "header": "Users",
        "description": "",
        "fields": [
            {"key": "userName", "header": "User Name", "type": "String"},
            {"key": "createDate", "header": "Create Date", "type": "DateTime"},
            {"key": "email", "header": "Email", "type": "String"},
            {"key": "emailVerified", "header": "Verified", "type": "Boolean"},
            {"key": "posts", "header": "Posts", "type": "Int", "relation": "post", "filter": "author"},
            {"key": "comments", "header": "Comments", "type": "Int", "relation": "comment", "filter": "author"},
            {"key": "role", "header": "Role", "type": "String"}
        ],
        "select" : {
            id: true,
            userName: true,
            createDate: true,
            email: true,
            emailVerified: true,
            _count: {
                select: { 
                    posts: true,
                    comments: true
                }
            },
            role: {
                select: {
                    // id: true
                    name: true
                }
            }
        },
        "destructur": (user) => ({
            ...user,
            posts: user._count.posts,
            comments: user._count.comments,
            role: user.role.name,
            _count: undefined // optionally remove the original _count field
        }),
        "filters": [
            {"name": "username", "key": "userName", "type": "userName"}, // by user name 
            {"name": "verified", "key": "emailVerified", "type": "Boolean"} // filter users by emailVerified
        ]
    },
      
    {
        "name": "Post",
        "header": "Posts",
        "description": "",
        "fields": [
            {"key": "createdAt", "header": "Create Date", "type": "DateTime"},
            {"key": "updatedAt", "header": "Update Date", "type": "DateTime"},
            {"key": "title", "header": "Title", "type": "String"},
            // {"key": "body", "header": "", "type": "", "visible": },
            {"key": "published", "header": "Published", "type": "Boolean"},
            {"key": "viewCount", "header": "Views", "type": "Int"},
            {"key": "author", "header": "Author", "type": "String"},
            {"key": "comments", "header": "Comments", "type": "Int"}
        ],
        "select": {
            id: true,
            createdAt: true,
            updatedAt: true,
            title: true,
            published: true,
            viewCount: true,
            author: {
                select: {
                    userName: true
                }
            },
            authorId: true,
            // comments: true
            _count:{
                select: {
                    comments: true
                }
            }

        },
        "destructur": (post) => ({
            ...post,
            author: post.author.name,
            comments: post._count.comments,
            _count: undefined
        }),
        "filters": [
            {"name": "author", "key": "authorId", "type": "ObjectID"} // filter posts by author
        ]
    },
      
    {
        "name": "Comment",
        "header": "Comments",
        "description": "",
        "fields": [
            {"key": "createdAt", "header": "Create Date", "type": "DateTime"},
            {"key": "comment", "header": "Comment", "type": "String"},
            {"key": "published", "header": "Published", "type": "Boolean"}
        ],
        "select": {
            id: true,
            createdAt: true,
            comment: true,
            published: true,
            post: {
                select:{
                    id: true
                }
            },
            postId: true
        }
    },
      
    {
        "name": "Role",
        "header": "Roles",
        "description": "",
        "fields": [
            {"key": "name", "header": "Name", "type": "String"},
            {"key": "description", "header": "Description", "type": "String"}
        ],
        "select": {
            id: true,
            name: true,
            description: true
        }
    }
]

export default modelsInterface