# Sample Express App With File Uploads

I created this app as a backend for the [React Native App](https://github.com/kulbirsaini/react-native-android-ios-app) that I worked on to learn React Native app building. It has pretty much everything required to support a basic Android/iOS app.

### Resources / Endpoints

- Authentication
  - Registration (`POST /auth/register`)
    - Requires `email`, `password`, `name`
  - Confirmation via token (`GET /auth/confirm/:token`)
  - Confirmation via OTP (`POST /auth/confirm/otp`)
    - Required Email and OTP for confirmation
  - Request Confirmation (`POST /auth/confirm`)
  - Login (`POST /auth/login`)
    - Returns JWT on successful authentication valid for 7 days
  - Logout (`DELETE /auth/logout`)
- Authenticated User
  - Profile (`GET /user/me`)
    - Using `Authorization` header
  - Generate Random Avatar (`POST /user/random-avatar`)
- Post
  - Fetch (`GET /posts`)
    - Supports various query parameters
  - Creation (`POST /posts`)
    - Supports file uploads to Imagekit.io
  - Like (`PUT /posts/:id/like`)
  - Unlike (`PUT /posts/:id/unlike`)
- Ticket
  - Fetch (`GET /tickets`)
    - Supports various query parameters
  - Creation (`POST /tickets`)
    - Requires `title`, `descirption`
- Hello!
  - Hello! (`GET /hello`)

### Dependencies

- MongoDB for data storage including session storage
- [Imagekit.io](https://imagekit.io/) for image and video uploads
- [Multer](https://github.com/expressjs/multer) as middleware file uploads using express.

### Setup

```bash
$ npm install
```

### Environment

- Copy `.env.example` to `.env`
- Generate [random strings](https://www.random.org/strings/) and set `JWT_SECRET` and `SESSION_SECRET`
- Set variables as per your [Imagekit.io](https://imagekit.io/) account

### Run

```bash
$ npm start
```

### Test

Default Port is 3000. Visit [http://localhost:3000/hello](http://localhost:3000/hello)
