const { PermissionFlagsBits } = require('discord.js');

const PERMISSION_LEVELS = {
    ADMIN: 3,
    MANAGER: 2,
    STAFF: 1,
    USER: 0
};

const ROLE_LEVELS = {
    'owner': PERMISSION_LEVELS.ADMIN,
    'manager': PERMISSION_LEVELS.MANAGER,
    'staff': PERMISSION_LEVELS.STAFF
};

const COMMAND_PERMISSIONS = {
    order: PERMISSION_LEVELS.STAFF,
    recentorders: PERMISSION_LEVELS.STAFF,
    analytics: PERMISSION_LEVELS.MANAGER,
    customers: PERMISSION_LEVELS.MANAGER,
    products: PERMISSION_LEVELS.MANAGER,
    checkaccountstock: PERMISSION_LEVELS.STAFF,
    blacklist: PERMISSION_LEVELS.ADMIN,
    settings: PERMISSION_LEVELS.ADMIN
};

function getUserPermissionLevel(member) {
    let highestLevel = PERMISSION_LEVELS.USER;
    
    // Server owner always gets admin (AKA)
    if (member.id === member.guild.ownerId) {
        return PERMISSION_LEVELS.ADMIN;
    }

    // Check roles
    member.roles.cache.forEach(role => {
        const roleLevel = ROLE_LEVELS[role.name];
        if (roleLevel && roleLevel > highestLevel) {
            highestLevel = roleLevel;
        }
    });

    return highestLevel;
}

function hasPermission(member, command) {
    const requiredLevel = COMMAND_PERMISSIONS[command];
    const userLevel = getUserPermissionLevel(member);
    return userLevel >= requiredLevel;
}

module.exports = {
    PERMISSION_LEVELS,
    ROLE_LEVELS,
    COMMAND_PERMISSIONS,
    getUserPermissionLevel,
    hasPermission
};