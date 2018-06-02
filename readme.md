## Usage
### How to run
docker-compose.yml included. You may build and run this application on Docker by executing the following command:
```
docker-compose up --build
```
Upon the server is up and running, you can fire get/post HTTP request to http://localhost:4000

## Folder Struture
| Name | Type | Description |
|:-----|:-----|:-----|
| dist | Folder | Contains compiled Javascript files and code needed for API Server |
| src | Folder | This folder that contain all typescript source code |
| test | Folder | Contains all test suites for route API  |
| .env.example | File | Config file to store google api key and URI for external hosted MongoDb (mLab)  |
| package.json | File | Contains all the dependencies need to be installed and some info about the Node application |
| tsconfig.json | File | Information for `tsc` compilation of the `.ts` files into `.js` files |
| tslint.json | File | Information for `tslint` linting the source code in `.ts` files |

## Mechanism
Since the desitantion parameter is a mandatory field in all google direction API requests, there is no way to calculate the shortest path in single 
API call. Instead, multiple API calls for computing the distance of all possible combination of routes is needed. Here's the basic logic of steps:

Let say we have 4 way points: A,B,C,D. A is the origin and the rest of them are dropoff points. The origin must be fixed, but the
final dropoff point (destination) could be varied depending on the location of other waypoints. To calculate the shortest path, 
we loop thorugh all possible routes to let google optimise the path for us:

```
A -> B -> C -> D
A -> B -> D -> C
A -> D -> C -> B
```

Once we obtained the distance of three possible routes from google API, we sort and pick the shortest path then return result back to our API Client. 

## Notes
Intermediate and final routing result stored onto externally hosted MogoDB server, I am using the free Sandbox plan with 0.5GB of storage which provided by mLab.