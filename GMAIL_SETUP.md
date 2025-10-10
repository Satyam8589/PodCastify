# Gmail SMTP Setup Guide for Contact Form

To make the contact form work with your Gmail account, you need to set up Gmail SMTP and update your environment variables.

## Step 1: Enable 2-Factor Authentication

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security" section
3. Enable "2-Step Verification" if not already enabled

## Step 2: Generate an App Password

1. Go to Google Account settings > Security
2. Under "2-Step Verification", click on "App passwords"
3. Select "Other (custom name)" and name it "PodCastify Contact Form"
4. Click "Generate"
5. Copy the 16-character password that Google provides

## Step 3: Update Environment Variables

Open your `.env` file and replace the placeholder values:

```env
# Replace with your actual Gmail address
GMAIL_USER=your-actual-email@gmail.com

# Replace with the 16-character app password from Step 2
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

## Step 4: Test the Contact Form

1. Start your development server: `npm run dev`
2. Navigate to the homepage
3. Scroll down to the Contact Us section
4. Fill out the form and submit
5. Check your Gmail inbox for the contact form submission

## Security Notes

- Never commit your actual Gmail credentials to version control
- Use environment variables for sensitive information
- The app password is specific to this application and can be revoked anytime
- Users will receive a confirmation email when they submit the form

## Troubleshooting

If emails aren't being sent:

1. Check that 2FA is enabled on your Google account
2. Verify the app password is correct (no spaces)
3. Make sure your Gmail address is correct
4. Check the browser console and server logs for error messages
5. Ensure your internet connection allows SMTP connections

## What Happens When Someone Submits the Form

1. **You receive an email** with:

   - Sender's name and email
   - Subject they entered
   - Their full message
   - Professional formatting

2. **The sender receives a confirmation email** with:

   - Thank you message
   - Copy of their submitted message
   - Your branding

3. **The form provides feedback**:
   - Success message when sent
   - Error message if something goes wrong
   - Loading state while sending
