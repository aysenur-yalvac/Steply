const fs = require('fs');
let path = 'src/components/dashboard/JoinByCodeInput.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('useSearchParams')) {
    content = content.replace(
      /import \{ useRouter \} from 'next\/navigation';/,
      `import { useRouter, useSearchParams } from 'next/navigation';\nimport { useEffect } from 'react';`
    );

    content = content.replace(
      /const router = useRouter\(\);/,
      `const router = useRouter();\n  const searchParams = useSearchParams();\n\n  useEffect(() => {\n    const joinToken = searchParams?.get('join');\n    if (joinToken) {\n      const autoJoin = async () => {\n        setIsLoading(true);\n        const result = await joinProjectWithCode(joinToken);\n        setIsLoading(false);\n        if (result.error) {\n          toast.error(result.error);\n        } else {\n          toast.success('Davet bağlantısı ile projeye katıldınız!');\n          if (result.projectId) {\n            router.push(\`/dashboard/projects/\${result.projectId}\`);\n          }\n        }\n      };\n      autoJoin();\n    }\n  }, [searchParams, router]);`
    );
    
    fs.writeFileSync(path, content, 'utf8');
    console.log('Added auto-join logic to JoinByCodeInput');
}
