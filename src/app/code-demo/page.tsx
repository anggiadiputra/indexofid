import SEOHead from '@/components/SEOHead';
import { env } from '@/config/environment';
import CodeBlock from '@/components/CodeBlock';
import { EnhancedContent } from '@/hooks/useCodeBlockEnhancer';

const sampleCode = {
  javascript: `// Example JavaScript function
function calculateFibonacci(n) {
  if (n <= 1) return n;
  
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  
  return b;
}

// Usage example
const result = calculateFibonacci(10);
console.log(\`Fibonacci(10) = \${result}\`);`,

  python: `# Python example with classes
class BlogPost:
    def __init__(self, title, content, author):
        self.title = title
        self.content = content
        self.author = author
        self.created_at = datetime.now()
    
    def get_excerpt(self, length=100):
        """Get post excerpt with specified length"""
        if len(self.content) <= length:
            return self.content
        return self.content[:length] + "..."
    
    def __str__(self):
        return f"{self.title} by {self.author}"

# Create a new blog post
post = BlogPost(
    title="Enhanced Code Blocks", 
    content="This is a demo of enhanced code blocks with copy functionality",
    author="Developer"
)

print(post.get_excerpt(50))`,

  php: `<?php
// WordPress custom post type example
function register_code_demo_post_type() {
    $args = array(
        'public' => true,
        'label'  => 'Code Demos',
        'supports' => array('title', 'editor', 'thumbnail'),
        'has_archive' => true,
        'rewrite' => array('slug' => 'code-demos'),
        'show_in_rest' => true,
        'menu_icon' => 'dashicons-editor-code'
    );
    
    register_post_type('code_demo', $args);
}

add_action('init', 'register_code_demo_post_type');

// Custom meta box for code language
function add_code_language_meta_box() {
    add_meta_box(
        'code_language',
        'Code Language',
        'code_language_callback',
        'code_demo'
    );
}

add_action('add_meta_boxes', 'add_code_language_meta_box');
?>`,

  css: `/* Modern CSS with custom properties */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #1e40af;
  --text-color: #1f2937;
  --bg-color: #ffffff;
  --code-bg: #1f2937;
  --code-text: #f9fafb;
}

.code-block-enhanced {
  background: var(--code-bg);
  color: var(--code-text);
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  margin: 1.5rem 0;
}

.code-header {
  background: rgba(55, 65, 81, 1);
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(75, 85, 99, 1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copy-button {
  background: rgba(75, 85, 99, 1);
  border: none;
  color: rgba(209, 213, 219, 1);
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-button:hover {
  background: rgba(107, 114, 128, 1);
  color: white;
}`,

  bash: `#!/bin/bash

# WordPress installation script
set -e

# Configuration
WP_DIR="/var/www/html"
DB_NAME="wordpress_db"
DB_USER="wp_user"
DB_PASS="secure_password"

echo "🚀 Starting WordPress installation..."

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install LAMP stack
sudo apt install -y apache2 mysql-server php php-mysql php-curl php-gd php-xml php-zip

# Download WordPress
cd /tmp
wget https://wordpress.org/latest.tar.gz
tar xzf latest.tar.gz

# Copy WordPress files
sudo cp -r wordpress/* $WP_DIR/
sudo chown -R www-data:www-data $WP_DIR
sudo chmod -R 755 $WP_DIR

# Create database
mysql -u root -p <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

echo "✅ WordPress installation completed!"
echo "🌐 Visit your site to complete setup"`
};

const wordpressContent = `
<h2>WordPress Code Block Example</h2>
<p>This demonstrates how WordPress code blocks are automatically enhanced with copy functionality.</p>

<pre class="wp-block-code"><code class="language-javascript">// This is a WordPress code block
const wpApiUrl = 'https://yoursite.com/wp-json/wp/v2';

async function fetchPosts() {
  try {
    const response = await fetch(\`\${wpApiUrl}/posts?_embed=true\`);
    const posts = await response.json();
    return posts;
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    return [];
  }
}

// Usage
fetchPosts().then(posts => {
  console.log(\`Found \${posts.length} posts\`);
});</code></pre>

<p>The enhanced code blocks automatically detect the language and provide copy functionality!</p>

<pre class="wp-block-code"><code class="language-php">&lt;?php
// WordPress theme functions.php example
function enqueue_custom_scripts() {
    wp_enqueue_script(
        'custom-js',
        get_template_directory_uri() . '/assets/js/custom.js',
        array('jquery'),
        '1.0.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'enqueue_custom_scripts');
?&gt;</code></pre>
`;

export default function CodeDemoPage() {
  return (
    <>
      <SEOHead
        url="/code-demo"
        customTitle={`Enhanced Code Blocks Demo | ${env.site.name}`}
        customDescription="Demonstration of enhanced code blocks with click-to-copy functionality, syntax highlighting, and automatic language detection."
        pageType="WebPage"
        fallbackEnabled={true}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              💻 Enhanced Code Blocks
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Automatic enhancement untuk WordPress code blocks dengan fitur click-to-copy, 
              syntax highlighting, dan auto-detection bahasa pemrograman.
            </p>
          </div>

          {/* Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Click to Copy
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Tombol copy otomatis dengan feedback visual dan fallback untuk browser lama.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Auto Detection
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Deteksi otomatis bahasa pemrograman berdasarkan syntax dan class name.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Enhanced UI
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Header dengan icon bahasa, line numbers, dan gradient overlay untuk code panjang.
              </p>
            </div>
          </div>

          {/* Code Examples */}
          <div className="space-y-8">
            
            {/* JavaScript Example */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                🟨 JavaScript Example
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Fibonacci calculation dengan modern ES6+ syntax:
              </p>
              <CodeBlock language="javascript" showLineNumbers={true}>
                {sampleCode.javascript}
              </CodeBlock>
            </div>

            {/* Python Example */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                🐍 Python Example
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Object-oriented programming dengan classes dan methods:
              </p>
              <CodeBlock language="python" showLineNumbers={true}>
                {sampleCode.python}
              </CodeBlock>
            </div>

            {/* PHP Example */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                🐘 PHP WordPress Example
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Custom post type registration dan meta boxes:
              </p>
              <CodeBlock language="php" showLineNumbers={true}>
                {sampleCode.php}
              </CodeBlock>
            </div>

            {/* CSS Example */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                🎨 CSS Example
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Modern CSS dengan custom properties dan responsive design:
              </p>
              <CodeBlock language="css" showLineNumbers={true}>
                {sampleCode.css}
              </CodeBlock>
            </div>

            {/* Bash Example */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                💻 Bash Script Example
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                WordPress installation automation script:
              </p>
              <CodeBlock language="bash" showLineNumbers={true}>
                {sampleCode.bash}
              </CodeBlock>
            </div>

            {/* WordPress Integration Example */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                🌐 WordPress Integration
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Contoh bagaimana WordPress code blocks otomatis di-enhance:
              </p>
              <EnhancedContent 
                content={wordpressContent}
                className="prose prose-lg max-w-none"
              />
            </div>
          </div>

          {/* Technical Details */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              🔧 Technical Implementation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Detection Logic</h4>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• CSS class detection (language-*)</li>
                  <li>• Pattern matching untuk syntax</li>
                  <li>• Keyword detection per bahasa</li>
                  <li>• Fallback ke auto-detection</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Copy Functionality</h4>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Modern clipboard API</li>
                  <li>• Fallback untuk browser lama</li>
                  <li>• Visual feedback (2 detik)</li>
                  <li>• Error handling yang robust</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">WordPress Integration</h4>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Automatic detection dari HTML</li>
                  <li>• Replace existing code blocks</li>
                  <li>• Preserve original formatting</li>
                  <li>• React component rendering</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Performance</h4>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Client-side only rendering</li>
                  <li>• Lazy component mounting</li>
                  <li>• Minimal re-renders</li>
                  <li>• Cleanup on unmount</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="mt-8 bg-gray-800 rounded-lg p-6 overflow-x-auto">
            <h3 className="text-lg font-semibold text-white mb-4">💻 Usage in WordPress</h3>
            <div className="text-green-400 text-sm font-mono">
              <div className="mb-2"># Dalam WordPress editor, gunakan Code block:</div>
              <div className="mb-2">1. Tambah block → Code</div>
              <div className="mb-2">2. Paste kode Anda</div>
              <div className="mb-2">3. (Optional) Tambah class &quot;language-[nama]&quot; untuk specific language</div>
              <div className="mb-4">4. Publish → Code block otomatis enhanced di frontend!</div>
              
              <div className="border-t border-gray-600 pt-4 mt-4">
                <div className="mb-2"># Supported languages:</div>
                <div>javascript, typescript, python, php, html, css, sql, bash, json, xml, yaml, markdown</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
} 