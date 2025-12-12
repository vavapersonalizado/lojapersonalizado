
export const ICON_SETS = {
    cart: [
        '🛒', // Standard
        '🛍️', // Shopping Bags
        '🎁', // Gift (Christmas)
        '🎒', // Backpack
        '🧺', // Basket
        '🎅', // Santa (Christmas)
        '🎄'  // Tree (Christmas)
    ],
    bell: [
        '🔔', // Standard
        '🔕', // Muted
        '🎺', // Trumpet
        '📣', // Megaphone
        '🎅', // Santa (Christmas)
        '🦌'  // Reindeer (Christmas)
    ],
    mobile: [
        '📱', // Mobile Phone
        '📲', // Mobile with Arrow
        '📶', // Signal
        '📵', // No Mobile
        '🤳'  // Selfie
    ],
    desktop: [
        '💻', // Laptop
        '🖥️', // Desktop
        '⌨️', // Keyboard
        '🖱️'  // Mouse
    ]
};

export const getRandomIcon = (type) => {
    const icons = ICON_SETS[type] || [];
    if (icons.length === 0) return '';
    const randomIndex = Math.floor(Math.random() * icons.length);
    return icons[randomIndex];
};
