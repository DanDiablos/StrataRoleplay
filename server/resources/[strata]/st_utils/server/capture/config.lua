---@class CaptureConfig
---@field DiscordWebhook string Discord webhook URL for screenshot uploads
---@field Encoding string Image encoding format: "webp", "png", "jpg"
---@field Quality number Image quality 0.0-1.0
---@field MaxWidth number Maximum screenshot width in pixels
---@field MaxHeight number Maximum screenshot height in pixels
---@field CommandName string Chat command name (empty = disabled)
---@field CommandPermission string ACE permission required for the command
CaptureConfig = {
    DiscordWebhook = "https://discord.com/api/webhooks/1492595685688742069/mWVkujG1EhP1YQ4pOABY63NRNGucdeJubvahCaVdxozK0z6Xbt0JdFFbU7sQpskbm3Ak",

    Encoding = "webp",
    Quality = 0.80,
    MaxWidth = 1920,
    MaxHeight = 1080,

    CommandName = "screenshot",
    CommandPermission = "command.screenshot",
}
