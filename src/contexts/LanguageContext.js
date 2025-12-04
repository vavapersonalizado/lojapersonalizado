"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
    pt: {
        common: {
            currency: '¥',
            add_to_cart: 'Adicionar ao Carrinho',
            added: 'Adicionado!',
            unavailable: 'Indisponível',
            edit: 'Editar',
            cancel: 'Cancelar',
            confirm: 'Confirmar',
            close: 'Fechar',
            save: 'Salvar',
            delete: 'Remover',
            loading: 'Carregando...',
            total: 'Total',
            subtotal: 'Subtotal',
            discount: 'Desconto',
            quantity: 'Quantidade',
            price: 'Preço',
            name: 'Nome',
            email: 'Email',
            phone: 'Telefone',
            notes: 'Observações',
        },
        header: {
            home: 'Início',
            products: 'Produtos',
            category: 'Categoria',
            events: 'Eventos',
            partners: 'Parceiros',
            sponsors: 'Patrocinadores',
            admin: 'Admin',
            login: 'Entrar',
            cart: 'Carrinho',
        },
        sidebar: {
            menu: 'Menu',
            admin_mode: 'Modo Admin',
            view_as_client: 'Ver como Cliente',
            clients: 'Clientes',
            orders: 'Pedidos',
            add_product: 'Adicionar Produto',
        },
        cart: {
            title: 'Carrinho',
            empty: 'Seu carrinho está vazio',
            checkout: 'Finalizar Pedido',
            clear: 'Limpar Carrinho',
            continue_shopping: 'Continuar Comprando',
        },
        checkout: {
            title: 'Finalizar Pedido',
            order_summary: 'Resumo do Pedido',
            coupon_code: 'Cupom de Desconto',
            enter_coupon: 'Digite o código do cupom',
            apply: 'Aplicar',
            validating: 'Validando...',
            coupon_applied: 'Cupom aplicado com sucesso!',
            confirm_order: 'Confirmar Pedido',
            processing: 'Processando...',
            email_notice: 'Ao confirmar, você receberá um email com os detalhes do pedido.',
        },
        order: {
            received: 'Pedido Recebido!',
            thank_you: 'Obrigado por seu pedido! Nossa equipe entrará em contato em até 24 horas para confirmar o prazo de entrega e a forma de pagamento.',
            email_sent: 'Você receberá todas as informações por email.',
            order_number: 'Pedido',
            status: {
                pending: 'Pendente',
                processing: 'Em Processamento',
                completed: 'Concluído',
                cancelled: 'Cancelado',
            },
        },
        admin: {
            manage_clients: 'Gerenciar Clientes',
            manage_orders: 'Gerenciar Pedidos',
            register_client: 'Cadastrar Cliente',
            client_info: 'Cliente',
            items: 'Itens',
            no_orders: 'Nenhum pedido encontrado',
            required: 'obrigatório',
        },
    },
    en: {
        common: {
            currency: '¥',
            add_to_cart: 'Add to Cart',
            added: 'Added!',
            unavailable: 'Unavailable',
            edit: 'Edit',
            cancel: 'Cancel',
            confirm: 'Confirm',
            close: 'Close',
            save: 'Save',
            delete: 'Remove',
            loading: 'Loading...',
            total: 'Total',
            subtotal: 'Subtotal',
            discount: 'Discount',
            quantity: 'Quantity',
            price: 'Price',
            name: 'Name',
            email: 'Email',
            phone: 'Phone',
            notes: 'Notes',
        },
        header: {
            home: 'Home',
            products: 'Products',
            category: 'Category',
            events: 'Events',
            partners: 'Partners',
            sponsors: 'Sponsors',
            admin: 'Admin',
            login: 'Login',
            cart: 'Cart',
        },
        sidebar: {
            menu: 'Menu',
            admin_mode: 'Admin Mode',
            view_as_client: 'View as Client',
            clients: 'Clients',
            orders: 'Orders',
            add_product: 'Add Product',
        },
        cart: {
            title: 'Cart',
            empty: 'Your cart is empty',
            checkout: 'Checkout',
            clear: 'Clear Cart',
            continue_shopping: 'Continue Shopping',
        },
        checkout: {
            title: 'Checkout',
            order_summary: 'Order Summary',
            coupon_code: 'Discount Coupon',
            enter_coupon: 'Enter coupon code',
            apply: 'Apply',
            validating: 'Validating...',
            coupon_applied: 'Coupon applied successfully!',
            confirm_order: 'Confirm Order',
            processing: 'Processing...',
            email_notice: 'By confirming, you will receive an email with order details.',
        },
        order: {
            received: 'Order Received!',
            thank_you: 'Thank you for your order! Our team will contact you within 24 hours to confirm delivery time and payment method.',
            email_sent: 'You will receive all information by email.',
            order_number: 'Order',
            status: {
                pending: 'Pending',
                processing: 'Processing',
                completed: 'Completed',
                cancelled: 'Cancelled',
            },
        },
        admin: {
            manage_clients: 'Manage Clients',
            manage_orders: 'Manage Orders',
            register_client: 'Register Client',
            client_info: 'Client',
            items: 'Items',
            no_orders: 'No orders found',
            required: 'required',
        },
    },
    es: {
        common: {
            currency: '¥',
            add_to_cart: 'Añadir al Carrito',
            added: '¡Añadido!',
            unavailable: 'No Disponible',
            edit: 'Editar',
            cancel: 'Cancelar',
            confirm: 'Confirmar',
            close: 'Cerrar',
            save: 'Guardar',
            delete: 'Eliminar',
            loading: 'Cargando...',
            total: 'Total',
            subtotal: 'Subtotal',
            discount: 'Descuento',
            quantity: 'Cantidad',
            price: 'Precio',
            name: 'Nombre',
            email: 'Email',
            phone: 'Teléfono',
            notes: 'Notas',
        },
        header: {
            home: 'Inicio',
            products: 'Productos',
            category: 'Categoría',
            events: 'Eventos',
            partners: 'Socios',
            sponsors: 'Patrocinadores',
            admin: 'Admin',
            login: 'Iniciar Sesión',
            cart: 'Carrito',
        },
        sidebar: {
            menu: 'Menú',
            admin_mode: 'Modo Admin',
            view_as_client: 'Ver como Cliente',
            clients: 'Clientes',
            orders: 'Pedidos',
            add_product: 'Añadir Producto',
        },
        cart: {
            title: 'Carrito',
            empty: 'Tu carrito está vacío',
            checkout: 'Finalizar Pedido',
            clear: 'Vaciar Carrito',
            continue_shopping: 'Continuar Comprando',
        },
        checkout: {
            title: 'Finalizar Pedido',
            order_summary: 'Resumen del Pedido',
            coupon_code: 'Cupón de Descuento',
            enter_coupon: 'Ingresa el código del cupón',
            apply: 'Aplicar',
            validating: 'Validando...',
            coupon_applied: '¡Cupón aplicado con éxito!',
            confirm_order: 'Confirmar Pedido',
            processing: 'Procesando...',
            email_notice: 'Al confirmar, recibirás un email con los detalles del pedido.',
        },
        order: {
            received: '¡Pedido Recibido!',
            thank_you: '¡Gracias por tu pedido! Nuestro equipo se pondrá en contacto en 24 horas para confirmar el plazo de entrega y forma de pago.',
            email_sent: 'Recibirás toda la información por email.',
            order_number: 'Pedido',
            status: {
                pending: 'Pendiente',
                processing: 'En Proceso',
                completed: 'Completado',
                cancelled: 'Cancelado',
            },
        },
        admin: {
            manage_clients: 'Gestionar Clientes',
            manage_orders: 'Gestionar Pedidos',
            register_client: 'Registrar Cliente',
            client_info: 'Cliente',
            items: 'Artículos',
            no_orders: 'No se encontraron pedidos',
            required: 'requerido',
        },
    },
    ja: {
        common: {
            currency: '¥',
            add_to_cart: 'カートに追加',
            added: '追加しました！',
            unavailable: '在庫なし',
            edit: '編集',
            cancel: 'キャンセル',
            confirm: '確認',
            close: '閉じる',
            save: '保存',
            delete: '削除',
            loading: '読み込み中...',
            total: '合計',
            subtotal: '小計',
            discount: '割引',
            quantity: '数量',
            price: '価格',
            name: '名前',
            email: 'メール',
            phone: '電話',
            notes: 'メモ',
        },
        header: {
            home: 'ホーム',
            products: '商品',
            category: 'カテゴリー',
            events: 'イベント',
            partners: 'パートナー',
            sponsors: 'スポンサー',
            admin: '管理者',
            login: 'ログイン',
            cart: 'カート',
        },
        sidebar: {
            menu: 'メニュー',
            admin_mode: '管理者モード',
            view_as_client: 'クライアントとして表示',
            clients: 'クライアント',
            orders: '注文',
            add_product: '商品を追加',
        },
        cart: {
            title: 'カート',
            empty: 'カートは空です',
            checkout: '注文を確定',
            clear: 'カートをクリア',
            continue_shopping: '買い物を続ける',
        },
        checkout: {
            title: '注文確定',
            order_summary: '注文概要',
            coupon_code: 'クーポンコード',
            enter_coupon: 'クーポンコードを入力',
            apply: '適用',
            validating: '確認中...',
            coupon_applied: 'クーポンが適用されました！',
            confirm_order: '注文を確定',
            processing: '処理中...',
            email_notice: '確認すると、注文詳細がメールで送信されます。',
        },
        order: {
            received: '注文を受け付けました！',
            thank_you: 'ご注文ありがとうございます！24時間以内に配送時期とお支払い方法について担当者よりご連絡いたします。',
            email_sent: 'すべての情報はメールで送信されます。',
            order_number: '注文',
            status: {
                pending: '保留中',
                processing: '処理中',
                completed: '完了',
                cancelled: 'キャンセル',
            },
        },
        admin: {
            manage_clients: 'クライアント管理',
            manage_orders: '注文管理',
            register_client: 'クライアント登録',
            client_info: 'クライアント',
            items: '商品',
            no_orders: '注文が見つかりません',
            required: '必須',
        },
    },
    tl: {
        common: {
            currency: '¥',
            add_to_cart: 'Idagdag sa Cart',
            added: 'Naidagdag na!',
            unavailable: 'Hindi Available',
            edit: 'I-edit',
            cancel: 'Kanselahin',
            confirm: 'Kumpirmahin',
            close: 'Isara',
            save: 'I-save',
            delete: 'Alisin',
            loading: 'Naglo-load...',
            total: 'Kabuuan',
            subtotal: 'Subtotal',
            discount: 'Diskwento',
            quantity: 'Dami',
            price: 'Presyo',
            name: 'Pangalan',
            email: 'Email',
            phone: 'Telepono',
            notes: 'Mga Tala',
        },
        header: {
            home: 'Home',
            products: 'Mga Produkto',
            category: 'Kategorya',
            events: 'Mga Kaganapan',
            partners: 'Mga Kasosyo',
            sponsors: 'Mga Sponsor',
            admin: 'Admin',
            login: 'Mag-login',
            cart: 'Cart',
        },
        sidebar: {
            menu: 'Menu',
            admin_mode: 'Admin Mode',
            view_as_client: 'Tingnan bilang Kliyente',
            clients: 'Mga Kliyente',
            orders: 'Mga Order',
            add_product: 'Magdagdag ng Produkto',
        },
        cart: {
            title: 'Cart',
            empty: 'Walang laman ang iyong cart',
            checkout: 'Tapusin ang Order',
            clear: 'I-clear ang Cart',
            continue_shopping: 'Magpatuloy sa Pamimili',
        },
        checkout: {
            title: 'Tapusin ang Order',
            order_summary: 'Buod ng Order',
            coupon_code: 'Coupon ng Diskwento',
            enter_coupon: 'Ilagay ang coupon code',
            apply: 'I-apply',
            validating: 'Nag-validate...',
            coupon_applied: 'Matagumpay na na-apply ang coupon!',
            confirm_order: 'Kumpirmahin ang Order',
            processing: 'Pinoproseso...',
            email_notice: 'Sa pagkumpirma, makakatanggap ka ng email na may detalye ng order.',
        },
        order: {
            received: 'Natanggap ang Order!',
            thank_you: 'Salamat sa iyong order! Makikipag-ugnayan ang aming koponan sa loob ng 24 oras upang kumpirmahin ang oras ng paghahatid at paraan ng pagbabayad.',
            email_sent: 'Makakatanggap ka ng lahat ng impormasyon sa email.',
            order_number: 'Order',
            status: {
                pending: 'Nakabinbin',
                processing: 'Pinoproseso',
                completed: 'Nakumpleto',
                cancelled: 'Kinansela',
            },
        },
        admin: {
            manage_clients: 'Pamahalaan ang mga Kliyente',
            manage_orders: 'Pamahalaan ang mga Order',
            register_client: 'Magrehistro ng Kliyente',
            client_info: 'Kliyente',
            items: 'Mga Item',
            no_orders: 'Walang nahanap na order',
            required: 'kinakailangan',
        },
    },
};

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('pt');

    useEffect(() => {
        const savedLang = localStorage.getItem('language');
        if (savedLang && translations[savedLang]) {
            setLanguage(savedLang);
        }
    }, []);

    const changeLanguage = (lang) => {
        if (translations[lang]) {
            setLanguage(lang);
            localStorage.setItem('language', lang);
        }
    };

    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];

        for (const k of keys) {
            value = value?.[k];
        }

        return value || key;
    };

    const formatCurrency = (amount) => {
        return `${t('common.currency')}${Math.round(amount).toLocaleString()}`;
    };

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t, formatCurrency }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
