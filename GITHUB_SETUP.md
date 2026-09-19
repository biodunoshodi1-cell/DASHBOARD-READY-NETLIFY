# Moving this project to GitHub

You have this project as a folder (unzipped from the download). Here's how
to get it into a GitHub repository so Netlify and Render can deploy from
it automatically.

## 1. Create an empty repository on GitHub

1. Go to **[github.com/new](https://github.com/new)**
2. Give it a name (e.g. `bright-learners`)
3. Leave **"Initialize this repository with a README"** UNCHECKED — this
   project already has its own README and files
4. Click **Create repository**
5. Copy the repository URL shown (looks like
   `https://github.com/your-username/bright-learners.git`)

## 2. Push this project to it

Open a terminal, `cd` into the unzipped project folder, then run:

```bash
git init
git add .
git commit -m "Initial commit: Bright Learners platform"
git branch -M main
git remote add origin https://github.com/your-username/bright-learners.git
git push -u origin main
```

Replace the URL in the `git remote add` line with the one you copied in
Step 1.5. If GitHub asks you to sign in, follow its prompts (it may ask
you to authenticate via browser or a personal access token instead of a
password).

## 3. Confirm it's there

Refresh your GitHub repository page — you should see all the project
files (`artifacts/`, `lib/`, `netlify.toml`, `README.md`, etc.).

## 4. Connect it to Netlify and Render

Now that the code is on GitHub, follow `NETLIFY_DEPLOYMENT.md` from
Step 1 onward — both Netlify and Render connect directly to a GitHub
repository (not a zip upload), and both auto-redeploy on every future
`git push`.

## Making changes later

Once connected, your workflow for any future change is:
```bash
# after editing files
git add .
git commit -m "Describe what you changed"
git push
```
Netlify and Render will pick up the push automatically within a minute or
two — no manual redeploy needed.

## If `git` isn't installed

- **Mac**: it's usually pre-installed; if not, running `git` in Terminal
  will prompt you to install Xcode Command Line Tools
- **Windows**: install [Git for Windows](https://git-scm.com/download/win)
- **Linux**: `sudo apt install git` (Debian/Ubuntu) or your distro's
  equivalent

## Alternative: GitHub Desktop (no terminal needed)

If you'd rather not use the command line:
1. Install **[GitHub Desktop](https://desktop.github.com)**
2. **File → Add local repository** → select your unzipped project folder
3. It will offer to initialize a repository — accept
4. Click **Publish repository**, name it, and choose whether it's public
   or private
5. Done — future changes just need **Commit** then **Push origin** in the
   app, no terminal required
