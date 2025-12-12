const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSchema() {
    try {
        console.log('Checking SiteSettings...');
        const settings = await prisma.siteSettings.findUnique({ where: { id: 'settings' } });
        console.log('SiteSettings keys:', Object.keys(settings || {}));
        if (settings && 'showBlog' in settings) {
            console.log('✅ showBlog field exists in SiteSettings');
        } else {
            console.error('❌ showBlog field MISSING in SiteSettings');
        }

        console.log('\nChecking BlogPost...');
        // Create a dummy post if none exists to check keys, or just findFirst
        let post = await prisma.blogPost.findFirst();
        if (!post) {
            console.log('No blog posts found, creating one to check schema...');
            post = await prisma.blogPost.create({
                data: {
                    embedUrl: 'https://test.com',
                    platform: 'OTHER',
                    title: 'Schema Test'
                }
            });
            console.log('Created test post:', post.id);
            // Clean up
            await prisma.blogPost.delete({ where: { id: post.id } });
        }

        console.log('BlogPost keys:', Object.keys(post || {}));
        if (post && 'visible' in post) {
            console.log('✅ visible field exists in BlogPost');
        } else {
            console.error('❌ visible field MISSING in BlogPost');
        }

    } catch (error) {
        console.error('Error checking schema:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSchema();
