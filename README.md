# Anonymous Question Submission System

A sophisticated question submission system that appears anonymous to users while collecting comprehensive identification data through browser fingerprinting.

## Features

### 🔍 **Advanced Fingerprinting**
- Browser characteristics collection (user agent, platform, screen resolution)
- WebGL and canvas fingerprinting
- Language and timezone detection
- Persistent identification across sessions

### 🏷️ **Short ID System**
- Converts long hex fingerprints to memorable short IDs
- Format: `adjective-noun-number` (e.g., `happy-eagle-42`)
- User-friendly while maintaining traceability

### 💾 **Database Integration**
- Supabase PostgreSQL backend
- Structured data storage for fingerprints, questions, and answers
- Real-time data synchronization

### 📱 **Modern UI/UX**
- Responsive design with TailwindCSS
- Smooth animations and transitions
- Real-time validation and feedback
- Mobile-optimized interface

### 🔔 **Discord Integration**
- Instant notifications for new questions
- Rich embeds with user identification data
- Database reference tracking

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Database**: Supabase (PostgreSQL)
- **Notifications**: Discord Webhooks
- **Styling**: Custom CSS with modern design
- **Deployment**: Static hosting compatible

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/anonymous-question-system.git
   cd anonymous-question-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials
   ```

4. **Start the development server**
   ```bash
   npx http-server -p 8000
   ```

5. **Open in browser**
   Navigate to `http://localhost:8000`

## Database Setup

### Supabase Configuration

1. Create a new Supabase project
2. Run the following SQL in the Supabase SQL Editor:

```sql
-- Fingerprints table to store user identification data
CREATE TABLE fingerprints (
    id VARCHAR(8) PRIMARY KEY,
    short_id VARCHAR(50) UNIQUE NOT NULL,
    user_agent TEXT,
    platform VARCHAR(100),
    screen_resolution VARCHAR(20),
    language VARCHAR(10),
    timezone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table to store submitted questions
CREATE TABLE questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text TEXT NOT NULL,
    fingerprint_id VARCHAR(8) REFERENCES fingerprints(id) ON DELETE CASCADE,
    short_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'answered', 'archived'))
);

-- Answers table for responses (optional)
CREATE TABLE answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    responder_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_questions_short_id ON questions(short_id);
CREATE INDEX idx_questions_fingerprint_id ON questions(fingerprint_id);
CREATE INDEX idx_questions_created_at ON questions(created_at);
CREATE INDEX idx_fingerprints_short_id ON fingerprints(short_id);
```

3. Update environment variables with your Supabase URL and anon key

## Discord Setup

1. Create a Discord server
2. Create a webhook channel
3. Update the `DISCORD_WEBHOOK_URL` in `script.js`

## Project Structure

```
├── index.html              # Main HTML file
├── script.js               # Core JavaScript functionality
├── styles.css              # Styling and animations
├── supabase-client.js      # Database operations
├── package.json            # Dependencies
└── README.md              # Documentation
```

## Security Considerations

- Environment variables are excluded from version control
- Supabase Row Level Security should be configured for production
- Discord webhook URL should be secured
- Consider rate limiting for question submissions

## Privacy & Ethics

This system is designed for research and feedback purposes. Ensure compliance with:
- GDPR and local privacy regulations
- Transparent disclosure of data collection
- Appropriate data retention policies
- User consent mechanisms

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

---

**Note**: This tool is designed for legitimate research and feedback collection. Use responsibly and in compliance with applicable laws and regulations.
