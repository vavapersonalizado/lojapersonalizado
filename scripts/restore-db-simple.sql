-- IMPORTANTE: Selecione o branch e database corretos no menu dropdown acima antes de executar!
-- Depois, execute cada bloco SEPARADAMENTE (um de cada vez)

-- BLOCO 1: Criar Categorias
INSERT INTO "Category" (id, name, slug, visible) VALUES (gen_random_uuid(), 'Canecas', 'canecas', true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, visible) VALUES (gen_random_uuid(), 'Camisetas', 'camisetas', true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, visible) VALUES (gen_random_uuid(), 'Adesivos', 'adesivos', true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO "Category" (id, name, slug, visible) VALUES (gen_random_uuid(), 'Brindes', 'brindes', true) ON CONFLICT (slug) DO NOTHING;

-- BLOCO 2: Criar Usuários Admin
INSERT INTO "User" (id, name, email, role, image, "emailVerified", "createdAt", "updatedAt") VALUES (gen_random_uuid(), 'Maicon Tsuda', 'maicontsuda@gmail.com', 'admin', '', NULL, NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET role = 'admin';
INSERT INTO "User" (id, name, email, role, image, "emailVerified", "createdAt", "updatedAt") VALUES (gen_random_uuid(), 'Projeto Van Vava', 'projetovanvava@gmail.com', 'admin', '', NULL, NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- BLOCO 3: Criar Produto de Exemplo
INSERT INTO "Product" (id, name, description, price, stock, "categoryId", images, "isCustomizable", sku, visible, "createdAt", "updatedAt")
SELECT gen_random_uuid(), 'Caneca Personalizada Exemplo', 'Caneca de cerâmica de alta qualidade.', 35.00, 100, (SELECT id FROM "Category" WHERE slug = 'canecas' LIMIT 1), ARRAY['https://placehold.co/600x400?text=Caneca+Exemplo'], true, 'CAN-001', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Product" WHERE name = 'Caneca Personalizada Exemplo');

-- BLOCO 4: Configurações
INSERT INTO "SiteSettings" (id, "showProducts", "showCategories", "showEvents", "showPromotions", "showPartners", "showSponsors", "showBlog") VALUES ('settings', true, true, true, true, true, true, true) ON CONFLICT (id) DO NOTHING;

-- BLOCO 5: Verificar Resultados
SELECT 'Categorias' as tipo, COUNT(*) as total FROM "Category" UNION ALL SELECT 'Usuários', COUNT(*) FROM "User" UNION ALL SELECT 'Produtos', COUNT(*) FROM "Product";
