# Clasy + Cloudflare R2 setup

Clasy now uploads notes directly from the browser to Cloudflare R2 using short-lived presigned PUT URLs. The Supabase `notes.file_path` column stores the R2 object key, not a public document URL. Downloads go through `/api/r2/download`, which creates a short-lived presigned GET URL and redirects the browser directly to R2.

Cloudflare's current R2 S3 API supports presigned GET/PUT/DELETE URLs. The R2 S3 endpoint is based on your account ID, and presigned URLs can be used directly by browsers. See the official docs: https://developers.cloudflare.com/r2/api/s3/presigned-urls/

## 1. Create the R2 bucket

Create a bucket named:

`clasy-notes`

You can use another name, but then set `R2_BUCKET_NAME` accordingly.

## 2. Create an R2 API token

In Cloudflare:

Storage & databases → R2 → Overview → Manage API Tokens → Create API Token

Give the token **Object Read & Write** access and restrict it to the `clasy-notes` bucket.

Keep the Access Key ID and Secret Access Key private.

## 3. Add environment variables

Create `.env.local` from `.env.local.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=clasy-notes
```

Never put the R2 secret in a `NEXT_PUBLIC_` variable.

## 4. Configure R2 CORS

Because the browser uploads directly to R2, add a CORS policy to the bucket. Replace the origin with your real Clasy deployment URL.

```json
[
  {
    "AllowedOrigins": ["https://your-clasy-domain.com", "http://localhost:3000"],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## 5. Run the Supabase SQL

Run `supabase/schema.sql` in the Supabase SQL editor. The project also includes `supabase/clasy_semester3_seed.sql`, which seeds the ABES CSE and CSE-DS Semester III timetable from the supplied timetable sheets. Run it after the base schema.

## 6. Install and run

```bash
npm install
npm run dev
```

## Upload flow

1. Admin/student selects a file in **Upload Notes**.
2. Clasy asks the Next.js server for a short-lived R2 upload URL.
3. The browser uploads the file directly to R2.
4. Clasy stores only the R2 object key in Supabase.

## Download flow

1. Student taps **Download**.
2. Clasy requests a short-lived R2 GET URL.
3. The server redirects the browser directly to R2.
4. The file downloads to the phone/laptop without passing through the Next.js server.

## Important security note

The existing project still supports the old client-side Admin PIN (`admin123`). That PIN is not suitable for production security because browser session storage can be manipulated. For a real college deployment, use Supabase Auth and verify the authenticated admin on the server before allowing R2 upload/delete URL generation.
