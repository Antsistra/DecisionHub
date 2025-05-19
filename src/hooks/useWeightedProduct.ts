import { useState, useEffect } from "react";
import supabase from "@/utils/supabase";

interface Alternative {
  id: string;
  kode: string;
  nama: string;
}

interface WeightedCriteria {
  id: string;
  nama_kriteria: string;
  kode: string;
  bobot: number;
  keterangan: string;
}

interface NilaiWP {
  alternatif_id: string;
  weighted_kriteria_id: string;
  nilai: number;
}

interface VectorS {
  alternatifId: string;
  kode: string;
  nama: string;
  vectorS: number;
}

interface FinalResult {
  alternatifId: string;
  kode: string;
  nama: string;
  vectorS: number;
  vectorV: number;
  rank: number;
}

export const useWeightedProduct = (projectId: string) => {
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [criteria, setCriteria] = useState<WeightedCriteria[]>([]);

  const [vectorS, setVectorS] = useState<VectorS[]>([]);
  const [finalResults, setFinalResults] = useState<FinalResult[]>([]);
  const [totalBobot, setTotalBobot] = useState<number>(0);
  const [normalizedWeights, setNormalizedWeights] = useState<{
    [key: string]: number;
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateVectorS = (
    alternatives: Alternative[],
    criteria: WeightedCriteria[],
    nilaiWp: NilaiWP[],
    normalizedWeights: { [key: string]: number }
  ): VectorS[] => {
    return alternatives.map((alt) => {
      let vectorS = 1;
      let allCriteriaHaveValues = true;

      criteria.forEach((crit) => {
        const nilaiEntry = nilaiWp.find(
          (n) =>
            n.alternatif_id === alt.id && n.weighted_kriteria_id === crit.id
        );

        if (
          !nilaiEntry ||
          nilaiEntry.nilai === null ||
          nilaiEntry.nilai === undefined
        ) {
          allCriteriaHaveValues = false;
          return;
        }

        const nilai = Number(nilaiEntry.nilai);
        let weight = normalizedWeights[crit.id] || 0;

        if (crit.keterangan.toLowerCase() === "cost") {
          weight = -weight;
        }

        if (!isNaN(nilai) && !isNaN(weight) && nilai > 0) {
          const power = Math.pow(nilai, weight);
          vectorS *= power;
        } else {
          allCriteriaHaveValues = false;
        }
      });

      return {
        alternatifId: alt.id,
        kode: alt.kode,
        nama: alt.nama,
        vectorS: allCriteriaHaveValues ? vectorS : 0,
      };
    });
  };

  const calculateFinalResults = (vectorSValues: VectorS[]): FinalResult[] => {

    const totalVectorS = vectorSValues.reduce((acc, curr) => acc + curr.vectorS, 0);


    const results = vectorSValues.map(vs => ({
      alternatifId: vs.alternatifId,
      kode: vs.kode,
      nama: vs.nama,
      vectorS: vs.vectorS,
      vectorV: totalVectorS > 0 ? (vs.vectorS / totalVectorS) : 0,
      rank: 0
    }));


    results.sort((a, b) => b.vectorV - a.vectorV);
    results.forEach((result, index) => {
      result.rank = index + 1;
    });

    return results;
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data: alternativesData, error: altError } = await supabase
        .from("alternatif")
        .select("id, kode, nama")
        .eq("project_id", projectId);

      if (altError) throw new Error(altError.message);
      if (alternativesData) setAlternatives(alternativesData);

      const { data: criteriaData, error: critError } = await supabase
        .from("weighted_kriteria")
        .select("id, nama_kriteria, kode, bobot, keterangan")
        .eq("project_id", projectId);

      if (critError) throw new Error(critError.message);
      
      if (criteriaData) {
        setCriteria(criteriaData);
        const total = criteriaData.reduce(
          (acc, curr) => acc + Number(curr.bobot),
          0
        );
        setTotalBobot(total);


        const normalizedWeights: { [key: string]: number } = {};
        criteriaData.forEach((c) => {
          normalizedWeights[c.id] = total > 0 ? Number(c.bobot) / total : 0;
        });
        setNormalizedWeights(normalizedWeights);

        const { data: nilaiData, error: nilaiError } = await supabase
          .from("nilai_wp")
          .select("alternatif_id, weighted_kriteria_id, nilai")
          .in("weighted_kriteria_id", criteriaData.map((c) => c.id));

        if (nilaiError) throw new Error(nilaiError.message);

        if (nilaiData && alternativesData) {
          

          const vectorSValues = calculateVectorS(
            alternativesData,
            criteriaData,
            nilaiData,
            normalizedWeights
          );
          setVectorS(vectorSValues);

          const results = calculateFinalResults(vectorSValues);
          setFinalResults(results);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  return {
    alternatives,
    criteria,
    vectorS,
    finalResults,
    totalBobot,
    normalizedWeights,
    isLoading,
    error,
    refetch: fetchData
  };
};

export type {
  Alternative,
  WeightedCriteria,
  NilaiWP,
  VectorS,
  FinalResult
};