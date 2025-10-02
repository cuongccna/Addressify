import { getServerEnv } from "@/config/env";
import axios from "axios";
import fs from "fs/promises";
import path from "path";

export interface GHNProvince {
  ProvinceID: number;
  ProvinceName: string;
  Code?: string;
  NameExtension?: string[];
}

export interface GHNDistrict {
  DistrictID: number;
  ProvinceID: number;
  DistrictName: string;
  Code?: string;
  Type?: number;
  SupportType?: number;
  NameExtension?: string[];
}

export interface GHNWard {
  WardCode: string;
  DistrictID: number;
  WardName: string;
  NameExtension?: string[];
  CanUpdateCOD?: boolean;
  SupportType?: number;
}

interface GHNApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

const CACHE_DIR = path.join(process.cwd(), "src", "data", "master-data");
const PROVINCE_CACHE = path.join(CACHE_DIR, "ghn-provinces.json");
const DISTRICT_CACHE = path.join(CACHE_DIR, "ghn-districts.json");

export class GHNMasterDataService {
  private baseURL: string;
  private token: string;

  constructor(baseURL: string, token: string) {
    this.baseURL = baseURL;
    this.token = token;
  }

  static fromEnv(): GHNMasterDataService {
    const env = getServerEnv();
    return new GHNMasterDataService(env.GHN_API_BASE_URL, env.GHN_API_TOKEN);
  }

  private async ensureCacheDir() {
    try {
      await fs.mkdir(CACHE_DIR, { recursive: true });
    } catch {
      // Directory may already exist
    }
  }

  async getProvinces(useCache = true): Promise<GHNProvince[]> {
    if (useCache) {
      try {
        const cached = await fs.readFile(PROVINCE_CACHE, "utf-8");
        return JSON.parse(cached);
      } catch {
        // Cache miss, fetch from API
      }
    }

    const response = await axios.get<GHNApiResponse<GHNProvince[]>>(
      `${this.baseURL}/master-data/province`,
      {
        headers: { Token: this.token }
      }
    );

    if (response.data.code !== 200) {
      throw new Error(`GHN API error: ${response.data.message}`);
    }

    const provinces = response.data.data;
    await this.ensureCacheDir();
    await fs.writeFile(PROVINCE_CACHE, JSON.stringify(provinces, null, 2));
    return provinces;
  }

  async getDistricts(provinceId?: number, useCache = true): Promise<GHNDistrict[]> {
    if (useCache && !provinceId) {
      try {
        const cached = await fs.readFile(DISTRICT_CACHE, "utf-8");
        return JSON.parse(cached);
      } catch {
        // Cache miss
      }
    }

    const url = provinceId
      ? `${this.baseURL}/master-data/district?province_id=${provinceId}`
      : `${this.baseURL}/master-data/district`;

    const response = await axios.get<GHNApiResponse<GHNDistrict[]>>(url, {
      headers: { Token: this.token }
    });

    if (response.data.code !== 200) {
      throw new Error(`GHN API error: ${response.data.message}`);
    }

    const districts = response.data.data;

    if (!provinceId) {
      await this.ensureCacheDir();
      await fs.writeFile(DISTRICT_CACHE, JSON.stringify(districts, null, 2));
    }

    return districts;
  }

  async getWards(districtId: number, useCache = true): Promise<GHNWard[]> {
    const cacheFile = path.join(CACHE_DIR, `ghn-wards-${districtId}.json`);

    if (useCache) {
      try {
        const cached = await fs.readFile(cacheFile, "utf-8");
        return JSON.parse(cached);
      } catch {
        // Cache miss
      }
    }

    const response = await axios.get<GHNApiResponse<GHNWard[]>>(
      `${this.baseURL}/master-data/ward?district_id=${districtId}`,
      {
        headers: { Token: this.token }
      }
    );

    if (response.data.code !== 200) {
      throw new Error(`GHN API error: ${response.data.message}`);
    }

    const wards = response.data.data;
    await this.ensureCacheDir();
    await fs.writeFile(cacheFile, JSON.stringify(wards, null, 2));
    return wards;
  }

  async getAllWards(useCache = true): Promise<GHNWard[]> {
    const allWardsCache = path.join(CACHE_DIR, "ghn-all-wards.json");

    if (useCache) {
      try {
        const cached = await fs.readFile(allWardsCache, "utf-8");
        return JSON.parse(cached);
      } catch {
        // Will fetch from API
      }
    }

    const districts = await this.getDistricts(undefined, useCache);
    const allWards: GHNWard[] = [];

    // Fetch wards for each district (with some rate limiting)
    for (const district of districts) {
      try {
        const wards = await this.getWards(district.DistrictID, false);
        allWards.push(...wards);
        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err) {
        console.warn(`Failed to fetch wards for district ${district.DistrictID}:`, err);
      }
    }

    await this.ensureCacheDir();
    await fs.writeFile(allWardsCache, JSON.stringify(allWards, null, 2));
    return allWards;
  }

  async syncAll(): Promise<{ provinces: number; districts: number; wards: number }> {
    const provinces = await this.getProvinces(false);
    const districts = await this.getDistricts(undefined, false);
    const wards = await this.getAllWards(false);

    return {
      provinces: provinces.length,
      districts: districts.length,
      wards: wards.length
    };
  }
}
