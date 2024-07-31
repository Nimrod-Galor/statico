const modelsInterface = [
    {
        "name": "User",
        header: "Users",
        "description": "",
        "fields": [
            {key: "userName", header: "User Name", type: "String"},//, visible: true, require: true},
            // {key: "password", header: "Password", type: "String"},//, visible: false, require: true},
            {key: "createDate", header: "Create Date", type: "DateTime"},//, visible: true, require: false},
            {key: "email", header: "Email", type: "String"},//, visible: true, require: true},
            {key: "emailVerified", header: "Verified", type: "Boolean", relation: "user", filter: "verified", filterKey: "emailVerified"},//, visible: true, require: false},
            {key: "posts", header: "Posts", type: "Int", relation: "post", filter: "author", filterKey: 'id'},//, visible: true, require: false},
            {key: "comments", header: "Comments", type: "Int", relation: "comment", filter: "author", filterKey: 'id'},//, visible: true, require: false},
            {key: "role", header: "Role", type: "String", relation: "user", filter: "role", filterKey: "roleId"},//, visible: true, require: true}
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
                    id: true,
                    name: true
                }
            }
        },
        "destructur": (user) => ({
            ...user,
            posts: user._count.posts,
            comments: user._count.comments,
            role: user.role.name,
            roleId: user.role.id,
            _count: undefined // optionally remove the original _count field
        }),
        "filters": [
            {"name": "username", key: "userName", type: "userName"}, // by user name 
            {"name": "verified", key: "emailVerified", type: "BooleanString"}, // filter users by emailVerified
            {"name": "role", key: "roleId", type: "ObjectID"}
        ]
    },
      
    {
        "name": "Post",
        header: "Posts",
        "description": "",
        "fields": [
            {key: "title", header: "Title", type: "String"},
            {key: "createDate", header: "Create Date", type: "DateTime"},
            {key: "updated", header: "Update Date", type: "DateTime"},
            // {key: "slug", header: "Slug", type: "String"},
            // {key: "body", header: "", type: "", "visible": },
            {key: "published", header: "Published", type: "Boolean"},
            {key: "viewCount", header: "Views", type: "Int"},
            {key: "author", header: "Author", type: "String", relation: "post", filter: "author", filterKey: 'authorId'},
            {key: "comments", header: "Comments", type: "Int", relation: "comment", filter: "post", filterKey: 'id'}
        ],
        "select": {
            id: true,
            createDate: true,
            updated: true,
            title: true,
            body: true,
            slug: true,
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
            author: post.author.userName,
            comments: post._count.comments,
            _count: undefined
        }),
        "filters": [
            {"name": "author", key: "authorId", type: "ObjectID"} // filter posts by author
        ]
    },
      
    {
        "name": "Comment",
        header: "Comments",
        "description": "",
        "fields": [
            {key: "createdAt", header: "Create Date", type: "DateTime"},
            {key: "comment", header: "Comment", type: "String"},
            {key: "published", header: "Published", type: "Boolean"}
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
        header: "Roles",
        "description": "",
        "fields": [
            {key: "name", header: "Name", type: "String"},
            {key: "description", header: "Description", type: "String"}
        ],
        "select": {
            id: true,
            name: true,
            description: true
        }
    }
]

export default modelsInterface