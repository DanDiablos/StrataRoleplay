---@class SimStoreConfig
---@field ReplaceCost number Cost to replace a stolen/lost SIM and keep your number
---@field BurnerCost number Cost of a brand new burner SIM with a fresh number
---@field StoreLocations vector4[] NPC spawn positions (x, y, z, heading)
---@field StorePedModel number|string Ped model hash for the store clerk
---@field StoreBlip { sprite: number, color: number, scale: number, label: string } Blip config

Config = Config or {}

---@type SimStoreConfig
Config.Sim = {
    ReplaceCost = 200,
    BurnerCost = 500,
    StoreLocations = {
        vector4(1137.653, -470.796, 66.653, 257.95),
    },
    StorePedModel = `s_m_m_strvend_01`,
    StoreBlip = {
        sprite = 739,
        color = 47,
        scale = 0.7,
        label = "Phone Store",
    },
}
