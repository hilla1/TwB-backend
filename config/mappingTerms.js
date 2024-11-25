// mappingTerms.js
const mappingTerms = {
    modules: {
      frontend: {
        keywords: [
          'frontend', 'ui', 'user interface', 'client-side', 'react', 'vue', 'angular',
          'html', 'css', 'javascript', 'web design', 'responsive design', 'frontend development',
          'frontend framework', 'single page application', 'synchronous', 'asynchronous',
          'ajax', 'web accessibility', 'cross-browser', 'frontend architecture', 'react hooks',
          'state management', 'component-based architecture', 'material design', 'bootstrap',
          'tailwindcss', 'user experience design', 'client-side rendering', 'server-side rendering',
          'webpack', 'babel', 'npm', 'yarn', 'typescript', 'progressive web apps', 'pwa',
          'react native', 'jquery', 'scss', 'sass', 'responsive web design', 'grid layout',
          'flexbox', 'icon fonts', 'svg', 'canvas', 'd3.js', 'chart.js', 'frontend testing',
          'end-to-end testing', 'unit testing', 'cross-platform', 'web performance', 'frontend optimization',
        ],
        skills: [
          'frontend', 'ui', 'user interface', 'HTML', 'CSS', 'JavaScript', 'React', 'Vue', 'Angular', 'Bootstrap', 'TailwindCSS',
          'SASS', 'jQuery', 'TypeScript', 'Webpack', 'Babel', 'Responsive Design', 'UI/UX Design',
          'SEO', 'Cross-Browser Compatibility', 'Version Control', 'Git', 'NPM', 'Yarn',
          'Progressive Web Apps', 'Single Page Applications', 'Client-Side Rendering', 'Accessibility Standards',
          'Testing Libraries (e.g., Jest, Cypress)', 'Performance Optimization', 'State Management Libraries (e.g., Redux, MobX)',
        ],
      },
      backend: {
        keywords: [
          'backend', 'server', 'api', 'database', 'node.js', 'express', 'java', 'ruby on rails',
          'php', 'c#', 'go', 'web server', 'application server', 'microservices', 'serverless',
          'restful', 'graphql', 'middleware', 'http', 'https', 'api gateway', 'data validation',
          'authentication', 'authorization', 'jwt', 'oauth', 'webhooks', 'websockets', 'tcp', 'udp',
          'asynchronous programming', 'caching', 'redis', 'docker', 'kubernetes', 'cloud computing',
          'amazon web services', 'aws', 'microsoft azure', 'google cloud platform', 'devops',
          'continuous integration', 'continuous deployment', 'backend architecture', 'server architecture',
          'database design', 'schema design', 'sql injection', 'security best practices',
        ],
        skills: [
          'backend', 'Node.js', 'database design', 'Express', 'Java', 'Ruby on Rails', 'PHP', 'C#', 'Go', 'Python', 'Django',
          'Flask', 'Microservices', 'API Development', 'RESTful APIs', 'GraphQL', 'MySQL', 'PostgreSQL',
          'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud',
          'Continuous Integration/Continuous Deployment (CI/CD)', 'Version Control Systems (e.g., Git)',
          'Serverless Architectures', 'Containerization', 'Microservices Architecture', 'Database Optimization',
          'API Security Best Practices', 'Monitoring and Logging Tools (e.g., Prometheus, Grafana)',
        ],
      },
      database: {
        keywords: [
          'database', 'sql', 'nosql', 'mysql', 'postgresql', 'mongodb', 'sqlite', 'data storage',
          'data modeling', 'data migration', 'data integrity', 'backup', 'restoration', 'data security',
          'data access layer', 'entity relationship diagram', 'erd', 'database normalization',
          'database performance', 'database indexing', 'transaction management', 'concurrency control',
          'data warehousing', 'big data', 'data lakes', 'etl', 'data visualization', 'data analysis',
        ],
        skills: [
          'database', 'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Oracle', 'Redis', 'Microsoft SQL Server',
          'Database Design', 'Data Modeling', 'ETL Processes', 'Data Warehousing', 'Big Data Analytics',
          'Data Mining', 'Data Analysis', 'Data Visualization', 'Data Security', 'Backup & Recovery',
          'Database Administration', 'SQL Optimization', 'Data Quality Management', 'Data Governance',
          'Schema Design', 'Stored Procedures', 'Database Performance Tuning',
        ],
      },
      branding: {
        keywords: [
          'branding', 'design', 'identity', 'graphic design', 'logo design', 'brand strategy',
          'visual identity', 'brand development', 'brand management', 'brand guidelines',
          'packaging design', 'advertising', 'market research', 'customer segmentation',
          'consumer behavior', 'storytelling', 'brand equity', 'sponsorship', 'influencer marketing',
          'rebranding', 'positioning', 'digital branding', 'brand awareness', 'brand loyalty',
          'customer experience', 'emotional branding', 'corporate identity', 'event branding',
        ],
        skills: [
          'branding', 'design', 'Graphic Design', 'Logo Design', 'Brand Strategy', 'Adobe Creative Suite', 'Illustrator',
          'Photoshop', 'InDesign', 'Brand Management', 'Market Research', 'Digital Marketing',
          'Social Media Management', 'Content Creation', 'Copywriting', 'SEO', 'Visual Communication',
          'Creative Direction', 'Typography', 'Brand Auditing', 'Market Positioning',
          'User Persona Development', 'Visual Identity Systems',
        ],
      },
      content: {
        keywords: [
          'content', 'copywriting', 'writing', 'content creation', 'blogging', 'editorial',
          'social media', 'content marketing', 'SEO', 'email marketing', 'content strategy',
          'storytelling', 'video content', 'podcasting', 'webinars', 'infographics',
          'content distribution', 'content management', 'content calendar', 'audience engagement',
        ],
        skills: [
          'Content Strategy', 'Copywriting', 'SEO Writing', 'Blog Writing', 'Content Marketing',
          'Social Media Strategy', 'Email Marketing', 'Video Editing', 'Podcasting', 'Editing',
          'Research', 'Analytics', 'Content Management Systems', 'CMS', 'WordPress', 'Squarespace',
          'Audience Analysis', 'Brand Voice Development', 'Content Optimization', 'Content Distribution Strategies',
          'Multimedia Content Production',
        ],
      },
      marketing: {
        keywords: [
          'marketing', 'seo', 'advertising', 'digital marketing', 'content marketing', 'social media',
          'email marketing', 'market research', 'analytics', 'ppc', 'paid advertising', 'campaign management',
          'conversion rate optimization', 'inbound marketing', 'outbound marketing', 'customer journey',
          'branding', 'public relations', 'event marketing', 'affiliates', 'influencer marketing',
          'search engine marketing', 'mobile marketing', 'remarketing', 'lead generation',
        ],
        skills: [
          'SEO', 'PPC Advertising', 'Social Media Marketing', 'Content Marketing', 'Analytics',
          'Google Ads', 'Facebook Ads', 'Email Campaigns', 'Market Research', 'Public Relations',
          'Brand Strategy', 'Event Planning', 'Data Analysis', 'Conversion Rate Optimization',
          'Customer Relationship Management (CRM)', 'Digital Advertising', 'Market Segmentation',
          'A/B Testing', 'Lead Generation Strategies', 'Influencer Partnerships',
        ],
      },
      mobile: {
        keywords: [
          'mobile', 'ios', 'android', 'react native', 'flutter', 'mobile app', 'mobile development',
          'native apps', 'hybrid apps', 'cross-platform', 'mobile design', 'mobile ui', 'mobile ux',
          'mobile testing', 'mobile deployment', 'app store', 'play store', 'push notifications',
          'app monetization', 'user retention', 'mobile analytics', 'mobile performance',
        ],
        skills: [
          'React Native', 'Flutter', 'Swift', 'Kotlin', 'Xamarin', 'Mobile UX/UI Design',
          'App Development', 'Mobile Testing', 'Firebase', 'API Integration', 'User Analytics',
          'Mobile Performance Optimization', 'Cross-Platform Development', 'App Store Optimization (ASO)',
          'Mobile Security Best Practices', 'User Experience Testing', 'In-App Purchase Integration',
        ],
      },
      ux: {
        keywords: [
          'ux', 'ui/ux', 'user experience', 'user interface', 'prototyping', 'user research',
          'interaction design', 'usability testing', 'user journey', 'wireframing', 'information architecture',
          'accessibility', 'visual hierarchy', 'responsive design', 'design systems', 'style guides',
          'user feedback', 'a/b testing', 'customer journey mapping', 'affordance',
        ],
        skills: [
          'User Experience Design', 'User Research', 'Wireframing', 'Prototyping', 'Usability Testing',
          'Interaction Design', 'Visual Design', 'Information Architecture', 'Design Systems',
          'User Interface Design', 'Accessibility Standards', 'Customer Journey Mapping',
          'A/B Testing', 'Feedback Analysis', 'Analytics Tools', 'Collaboration with Developers',
        ],
      },
    },
  };
  
  export default mappingTerms;
  