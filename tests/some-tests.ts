import {
  action,
  actionRequest,
  args,
  array,
  BlueprintPropertyType,
  BlueprintType,
  createApp,
  model,
  ModelType,
  optional, select,
  selection,
  validator
} from "../framework/core/src/app";

export const StatusBlueprint = model("map-bit", {
    status: String,
})

export const UserUpdateRequest = actionRequest({
    query: {
        name: String,
        count: Number,
    },
    body: {
        id: Number,
        firstName: String,
        lastName: String,
        // status: ["active", "banned"],
        allNames: optional(array(String)),
        photos: array({
            id: optional(String),
            name: String
        })
    },
    return: array(StatusBlueprint)
})

export const userUpdateAction = action(UserUpdateRequest, async ({ query, body }) => {

    // console.log(body.lastName)
    // body.allNames.forEach(photo => photo.id.length)
    // body.
    // body.photos!.map(ph oto => photo.)
    return [{
        status: "false"
    }]
})

export const mapBitBlueprint = model("map-bit", {
    id: Number,
    lat: Number,
    lng: Number
})

export const bitBlueprint = model("bit", {
    id: Number,
    name: String,
    mapBit: mapBitBlueprint
    // mapBit: reference<typeof mapBitBlueprint>("map-bit")
})

export const bitValidator = validator(bitBlueprint, {
    id: {
        min: 0,
        max: 100
    },
    name: {
        maxLength: 30,
        minLength: 2,
    }
})
//
// export const bitEntity = entity(bitBlueprint, {
//     id: {
//       type: "int"
//     },
//     name: {
//         default: ""
//     }
// })

// export const bitResolver = resolver(bitBlueprint, {
//     name: () => "undefined",
//     mapBit: bit => {
//         return {
//             id: 1,
//             lat: 2,
//             lng: 31
//         }
//     }
// })

export const bitSelection = selection(bitBlueprint, {
    id: true,
    mapBit: {
        lat: true
    }
})

export const b: BlueprintPropertyType<typeof bitSelection> = {
    id: 1,
    mapBit: {
        lat: 1
    }
}

export const appDataRequest = actionRequest({
    return: {
        bit: bitSelection,
        providers: array({
            id: String,
            name: String,
            api: String,
            balance: optional(Number),
        }),
    },
  })

  export const appDataAction = action(appDataRequest, () => {
    return {
        bit: {
            id: 1,
            mapBit: {
                lat: 1,
            }
        },
        providers: [
            { id: "1", name: "adada", api: "ada" }
        ]
    }
  })


export const AlbumModel = model("Album", {
    id: Number,
    title: String,
})

export const PhotoModel = model("Photo", {
    id: Number,
    filename: String,
    album: args(AlbumModel, {
        limit: Number
    })
})

export const CategoryModel = model("Category", {
    id: Number,
    name: String,
    avatar: args(PhotoModel, {
        keyword: String
    })
})

export const PostModel = model("Post", {
    id: Number,
    name: String,
    description: String,
    likes: Number,
    photo: PhotoModel,
    mainPhoto: args(PhotoModel, {
        keyword: String
    }),
    photos: array(PhotoModel),
    categories: args(array(CategoryModel), {
        keyword: String
    })
})

export type PostType = ModelType<typeof PostModel>
export type CategoryType = ModelType<typeof CategoryModel>


export const Queries = {
    posts: array(PostModel),
    post: args(PostModel, {
      id: Number
    }),
}

export const Mutations = {
    savePost: PostModel,
    deletePost: args(PostModel, {
      id: Number
    }),
}

export const Models = {
    PostBlueprint: PostModel,
    CategoryBlueprint: CategoryModel,
    PhotoBlueprint: PhotoModel,
    AlbumBlueprint: AlbumModel,
}

export const app = createApp({
    queries: Queries,
    mutations: Mutations,
    models: Models,
    inputs: {},
})

app.query("posts").resolve(() => {
    return [
        {
            id: 1,
            name: "Umed",
            description: "about umed",
            likes: 10,
            photo: {
                id: 2,
                filename: "hey mr policeman2",
                album: {
                    id: 1,
                    title: "Me"
                }
            },
            mainPhoto: {
                id: 1,
                filename: "hey mr policeman",
                album: {
                    id: 1,
                    title: "Me"
                }
            },
            photos: [],
            categories: [],
            // categories: [
                // { id: 1, n2ame: "hello" } // todo
            // ]
        }
    ]
})

app.query("post").select({
    select: {
        id: true,
        name: true,
        photos: {
            filename: true
        },
        mainPhoto: {
            select: {
                filename: true
            },
            args: {
                keyword: "my"
            }
        },
        categories: {
            args: {
                keyword: "%hello"
            },
            select: {
                name: true,
                avatar: {
                    select: {
                        filename: true
                    },
                    args: {
                        keyword: "my"
                    }
                }
            }
        }
    },
    args: {
        id: 1
    }
}).fetch().then(post => {
    // console.log(post.photos.forEach(photo => photo.filename))
    // console.log(post.mainPhoto.filename)
    // console.log(post.categories.forEach(category => category.avatar.filename))
})

app.query("posts").select({
    select: {
        id: true,
        name: true,
        likes: true
    },
}).subscribe(posts => {
    // posts[0].
    // posts.forEach(post => post.name)
})

app.model("PostBlueprint").resolve({
    name() {
        return "1"
    },
    mainPhoto(parent, args) {
        console.log(args.keyword)
        return {
            id: 1,
            filename: "hey mr policeman",
            album: {
                // todo: what if we want to resolve album using resolver?
                // if so, we need to make optional objects in the returned object?
                id: 1,
                title: "hello"
            }
        }
    }
})

// todo: think about exported selection queries (to make restricted queries from server)
//       take a note that there are can be multiple clients (including microservices) that can send queries
//       also have in mind about parameters, most likely parameters for such queries will be argument based
// todo: implement __typename?
// todo: what about fragments? (looks like they are just same models we have? but for selection? can we just use rest/spread syntax?)
// todo: what about graphql enums?
// todo: graphql union types?

select(
  app.query("post"),
  {
    select: {
        id: true,
        name: true,
        photos: {
            filename: true
        },
        mainPhoto: {
            select: {
                filename: true
            },
            args: {
                keyword: "dasd"
            }
        },
        photo: {
            // select: {
            //     id: true,
            // },
            aliases: {
                albumWithId: {
                    name: "album",
                    select: {
                        id: true
                    },
                    args: {
                        limit: 1
                    }
                },
                albumWithFilename: {
                    name: "album",
                    select: {
                        filename: true
                    },
                    args: {
                        limit: 1
                    }
                }
            }
        }
        // categories: {
        //     args: {
        //         keyword: "dasdasd"
        //     },
        //     select: {
        //         avatar: {
        //             filename: true
        //         }
        //     }
        // }
        /* aliases([
            {
                alias: "myPhotos" as const,
                select: {
                    filename: true
                }
            }
        ]), */
    },
    args: {
        id: 1
    },
    /* aliases: {
        photosWithFilenames: {
            name: "photos",
            select: {
                filename: true
            }
        },
        photosWithJustIds: {
            name: "photos",
            select: {
                id: true
            }
        },
    } */
}).fetch().then(post => {
    // post.photo.albumWithFilename.title
    // console.log(post.photos.forEach(photo => photo.filename))
    // console.log(post.mainPhoto.filename)
    // console.log(post.categories.forEach(category => category.avatar.filename))
})


app.aggregate({
    firstPost: app.query("post").select({
        select: {
            id: true,
            name: true
        },
        args: {
            id: 1
        }
    }),
    secondPost: app.query("post").select({
        select: {
            id: true,
            name: true
        },
        args: {
            id: 2
        }
    }),
    allPosts: app.query("posts").select({
        select: {
            id: true,
            name: true
        }
    })
})
    .fetch()
    // .then(({ firstPost, allPosts }) => {
        // allPosts.map(post => post.)
        // console.log(firstPost.name)
        // console.log(allPosts.map(post => post.id))
    // })

type a = BlueprintType<typeof PostModel["blueprint"], {
    id: true,
    name: true,
    photos: {
        filename: true
    },
    mainPhoto: {
        select: {
           id: true
        },
        args: {
            keyword: "dasdas"
        },
        aliases: {
            albumsWithJustIds: {
                name: "album",
                select: {
                    id: true
                },
                args: {
                    limit: 1
                }
            },
            albumWithTitles: {
                name: "album",
                select: {
                    title: true
                },
                args: {
                    limit: 1
                }
            },
        }
    }
}>

const aa: a = {
    id: 1,
    name: "adas",
    photos: [{
        filename: "ddasda"
    }],
    mainPhoto: {
        id: 1,
        albumWithTitles: {
            title: "helllo"
        },
        albumsWithJustIds: {
            id: 1
        }
    }
}

console.log(aa.mainPhoto.albumWithTitles.title);


