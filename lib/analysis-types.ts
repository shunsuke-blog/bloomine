export type FlowerFragment = {
  roots: { log_index: number; root: string }[];
  is_new_flower: boolean;
  flower_id?: string;
  flower_name?: string;
  os_description?: string;
  logic_reflection?: string;
  environment_condition?: string;
  via_category?: string;
};

export type TreasureFragment = {
  sites: { log_index: number; site: string }[];
  is_new_treasure: boolean;
  treasure_id?: string;
  treasure_name?: string;
  description?: string;
  keywords?: string[];
  fulfillment_state?: string;
  threat_signal?: string;
  act_category?: string;
};
