import Link from 'next/link';

// 📋 1. Define the tools array (including your new Backlink Seeker!)
const toolsList = [
  {
    title: 'Local Business Schema Generator',
    description: 'Create structured JSON-LD data for your local business to boost your visibility in Google search results.',
    link: '/tools/local-business-schema',
    icon: '🏢',
    badge: 'Popular'
  },
  {
    title: 'Free Backlink Seeker & Checker',
    description: 'Analyze any live domain or URL to instantly discover, crawl, and track active incoming link connections.',
    link: '/tools/backlink-seeker',
    icon: '🚀',
    badge: 'New'
  }
  // 💡 You can easily paste more tool objects here in the future!
];

export const metadata = {
  title: 'Free SEO & Marketing Tools Platform | RankinSEO',
  description: 'Boost your digital footprint with our suite of completely free production optimization tools.',
};

export default function ToolsIndexPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-3">
            RankinSEO Project Platform Tools
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our collection of free marketing utilities designed to streamline your development and content pipeline.
          </p>
        </div>

        {/* 🎨 2. Dynamic Grid Grid System */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {toolsList.map((tool, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Badge rendering */}
                {tool.badge && (
                  <span className={`absolute top-4 right-4 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    tool.badge === 'New' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {tool.badge}
                  </span>
                )}
                
                <div className="text-3xl mb-3">{tool.icon}</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{tool.title}</h2>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{tool.description}</p>
              </div>

              <Link 
                href={tool.link}
                className="w-full text-center bg-gray-900 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-gray-800 transition duration-150 text-sm block"
              >
                Open Free Tool →
              </Link>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
