---@meta

---@class StrataAccount Player object returned by Strata.User.Account.
---@field Permissions { IsStaff: fun(self):boolean, IsAdmin: fun(self):boolean, GetLevel: fun(self):integer }
---@field GetData fun(self, key?: string): any
---@field SetData fun(self, key: string, value: any)

---@class StrataCharacter Character store returned by Strata.User.Find.
---@field GetData fun(self, key?: string): any
---@field SetData fun(self, key: string, value: any)

---@class StrataAlertOpts
---@field kind?     "info" | "ok" | "warn" | "bad"
---@field duration? integer  duration in milliseconds (default 4000)

---@class StrataLogOpts
---@field console?  boolean
---@field file?     boolean
---@field discord?  boolean | { embed?: boolean, type?: string, webhook?: string, title?: string, description?: string, content?: string }
---@field database? boolean

---@class StrataClockOpts
---@field style?    "hms"      | "compact" | "long"
--   hms     -> "01:02:05"   (default)
--   compact -> "1h 2m 5s"
--   long    -> "1 hour, 2 minutes, 5 seconds"
