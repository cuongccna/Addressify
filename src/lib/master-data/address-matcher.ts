import fs from "fs/promises";
import path from "path";
import type { GHNProvince, GHNDistrict, GHNWard } from "./ghn-master-data";

const CACHE_DIR = path.join(process.cwd(), "src", "data", "master-data");

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateSimilarity(a: string, b: string): number {
  const aNorm = normalizeText(a);
  const bNorm = normalizeText(b);

  if (aNorm === bNorm) return 1;
  if (aNorm.includes(bNorm) || bNorm.includes(aNorm)) return 0.8;

  // Simple word overlap scoring
  const aWords = aNorm.split(" ");
  const bWords = bNorm.split(" ");
  const bSet = new Set(bWords);
  
  let intersectionCount = 0;
  for (const word of aWords) {
    if (bSet.has(word)) intersectionCount++;
  }
  
  const unionCount = new Set([...aWords, ...bWords]).size;
  return unionCount > 0 ? intersectionCount / unionCount : 0;
}

export interface MatchedProvince {
  id: number;
  name: string;
  confidence: number;
}

export interface MatchedDistrict {
  id: number;
  name: string;
  provinceId: number;
  confidence: number;
}

export interface MatchedWard {
  code: string;
  name: string;
  districtId: number;
  confidence: number;
}

export class AddressMatcher {
  private provinces: GHNProvince[] = [];
  private districts: GHNDistrict[] = [];
  private allWards: GHNWard[] = [];

  async loadCache(): Promise<void> {
    try {
      const [provincesData, districtsData, wardsData] = await Promise.all([
        fs.readFile(path.join(CACHE_DIR, "ghn-provinces.json"), "utf-8"),
        fs.readFile(path.join(CACHE_DIR, "ghn-districts.json"), "utf-8"),
        fs.readFile(path.join(CACHE_DIR, "ghn-all-wards.json"), "utf-8")
      ]);

      this.provinces = JSON.parse(provincesData);
      this.districts = JSON.parse(districtsData);
      this.allWards = JSON.parse(wardsData);
    } catch {
      console.warn("[AddressMatcher] Cache not found. Please sync master data first.");
      throw new Error("Master data not available. Please sync first via /api/master-data/sync");
    }
  }

  findProvince(query: string): MatchedProvince | null {
    if (!this.provinces.length) return null;

    let bestMatch: { province: GHNProvince; score: number } | null = null;

    for (const province of this.provinces) {
      const score = calculateSimilarity(query, province.ProvinceName);

      // Check extensions if available
      if (province.NameExtension) {
        for (const ext of province.NameExtension) {
          const extScore = calculateSimilarity(query, ext);
          if (extScore > score) {
            if (!bestMatch || extScore > bestMatch.score) {
              bestMatch = { province, score: extScore };
            }
          }
        }
      }

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { province, score };
      }
    }

    if (bestMatch && bestMatch.score >= 0.6) {
      return {
        id: bestMatch.province.ProvinceID,
        name: bestMatch.province.ProvinceName,
        confidence: bestMatch.score
      };
    }

    return null;
  }

  findDistrict(query: string, provinceId?: number): MatchedDistrict | null {
    if (!this.districts.length) return null;

    const candidates = provinceId
      ? this.districts.filter((d) => d.ProvinceID === provinceId)
      : this.districts;

    let bestMatch: { district: GHNDistrict; score: number } | null = null;

    for (const district of candidates) {
      const score = calculateSimilarity(query, district.DistrictName);

      if (district.NameExtension) {
        for (const ext of district.NameExtension) {
          const extScore = calculateSimilarity(query, ext);
          if (extScore > score) {
            if (!bestMatch || extScore > bestMatch.score) {
              bestMatch = { district, score: extScore };
            }
          }
        }
      }

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { district, score };
      }
    }

    if (bestMatch && bestMatch.score >= 0.6) {
      return {
        id: bestMatch.district.DistrictID,
        name: bestMatch.district.DistrictName,
        provinceId: bestMatch.district.ProvinceID,
        confidence: bestMatch.score
      };
    }

    return null;
  }

  findWard(query: string, districtId?: number): MatchedWard | null {
    if (!this.allWards.length) return null;

    const candidates = districtId
      ? this.allWards.filter((w) => w.DistrictID === districtId)
      : this.allWards;

    let bestMatch: { ward: GHNWard; score: number } | null = null;

    for (const ward of candidates) {
      const score = calculateSimilarity(query, ward.WardName);

      if (ward.NameExtension) {
        for (const ext of ward.NameExtension) {
          const extScore = calculateSimilarity(query, ext);
          if (extScore > score) {
            if (!bestMatch || extScore > bestMatch.score) {
              bestMatch = { ward, score: extScore };
            }
          }
        }
      }

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { ward, score };
      }
    }

    if (bestMatch && bestMatch.score >= 0.6) {
      return {
        code: bestMatch.ward.WardCode,
        name: bestMatch.ward.WardName,
        districtId: bestMatch.ward.DistrictID,
        confidence: bestMatch.score
      };
    }

    return null;
  }

  async resolveAddress(province: string, district: string, ward?: string): Promise<{
    province: MatchedProvince | null;
    district: MatchedDistrict | null;
    ward: MatchedWard | null;
  }> {
    await this.loadCache();

    const matchedProvince = this.findProvince(province);
    const matchedDistrict = this.findDistrict(
      district,
      matchedProvince?.id
    );
    const matchedWard = ward
      ? this.findWard(ward, matchedDistrict?.id)
      : null;

    return {
      province: matchedProvince,
      district: matchedDistrict,
      ward: matchedWard
    };
  }
}
