# React AI OCR

A web application that uses Google's Gemini AI for Optical Character Recognition (OCR) on uploaded images, stores the results, and displays a history of past extractions.

This project was built with React (using Vite) and styled with Tailwind CSS. It leverages the Google Gemini API for its powerful multimodal OCR capabilities and uses Supabase for database storage.

## Features

-   **AI-Powered OCR:** Upload an image and extract text using the Google Gemini AI model.
-   **Extraction History:** Automatically saves each OCR result to a Supabase database.
-   **History Page:** View a list of all previously extracted text with timestamps.
-   **Modern UI:** A clean and responsive user interface built with React and Tailwind CSS.

## Tech Stack

-   **Frontend:**
    -   React
    -   Vite
    -   Tailwind CSS
-   **Backend & Services:**
    -   **AI Model:** Google Gemini
    -   **Database:** Supabase

## Prerequisites

-   Node.js and npm (or a compatible package manager)
-   A Google Gemini API Key
-   A Supabase project (for URL and Publishable Key)

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/react-ai-ocr.git
    cd react-ai-ocr
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    -   Create a file named `.env` in the root of the project.
    -   Copy the contents of `.env.example` and add your credentials. It should look like this:

    ```env
    VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
    VITE_SUPABASE_PUBLISHABLE_KEY="YOUR_SUPABASE_PUBLISHABLE_KEY"
    ```

## Running the Application

Once the setup is complete, run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).
