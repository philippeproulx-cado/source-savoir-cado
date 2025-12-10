import { GoogleGenAI } from "@google/genai";
import { ResearchResult, GroundingMetadata, SearchOptions, BrainstormResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const fetchAspectResearch = async (subject: string, aspect: string, options: SearchOptions): Promise<ResearchResult> => {
  try {
    let formatInstruction = "";
    
    if (options.type === 'sources') {
      formatInstruction = `
        FORMAT : "Sources Uniquement".
        - Tâche : Trouve les 5 à 8 MEILLEURES pages web fiables pour que l'élève puisse écrire son texte lui-même.
        - Ne rédige PAS de résumé. Ton texte de réponse doit être une phrase unique : "Voici les sources trouvées pour t'aider à rédiger ton texte sur l'aspect : ${aspect}."
        - Concentre toute ta puissance de recherche sur la découverte de liens pertinents (Google Search).
      `;
    } else if (options.type === 'short') {
      formatInstruction = `
        FORMAT : "Version Prise de notes (Style Télégraphique)".
        - Règle ABSOLUE : NE PAS rédiger de phrases complètes. INTERDICTION de faire des phrases Sujet-Verbe-Complément.
        - Utilise uniquement des mots-clés, des fragments de phrases ou des verbes à l'infinitif.
        - Style télégraphique strict.
        - Exemple CORRECT : "Habitat : ruche, tronc d'arbre ou creux de rocher."
        - Exemple INCORRECT (à ne pas faire) : "Les abeilles vivent généralement dans des ruches."
        - Le but est de donner la matière brute pour que l'élève soit OBLIGÉ de construire ses phrases lui-même.
        - Maximum 5 à 7 points clés.
      `;
    } else {
      formatInstruction = `
        FORMAT : "Version Longue (Explicative)".
        - Rédige un petit texte explicatif structuré.
        - Inclus une courte phrase d'introduction et des détails intéressants.
        - Utilise un ton pédagogique qui peut servir de modèle de rédaction.
      `;
    }

    let languageInstruction = "Règle source : Cherche UNIQUEMENT dans des sources francophones.";
    if (options.includeEnglishSources) {
      languageInstruction = "Règle source : Tu peux chercher dans des sources Anglophones et Francophones (privilégie les sources anglophones sérieuses si elles sont plus pertinentes, mais résume TOUJOURS en Français).";
    }

    const prompt = `
      Sujet principal: ${subject}
      Aspect spécifique à rechercher: ${aspect}
      
      Tâche : Effectue une recherche pour des élèves de 8 à 12 ans sur cet aspect précis du sujet.
      
      ${languageInstruction}
      
      Règles strictes de contenu :
      1. Utilise UNIQUEMENT des sources sérieuses : sites gouvernementaux (.gov, .gouv), encyclopédies reconnues (Larousse, Universalis, Britannica), dictionnaires en ligne, grandes associations ou fondations.
      2. N'utilise PAS Wikipédia, les blogs personnels ou les forums.
      3. Le ton doit être joyeux mais professionnel.
      4. Si tu ne trouves pas d'informations fiables sur cet aspect spécifique, dis-le poliment.

      ${formatInstruction}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "Tu es un assistant pédagogique pour des enfants de 8 à 12 ans. Tu aides à faire des recherches scolaires sérieuses.",
      },
    });

    const text = response.text || "Aucune information trouvée.";
    
    // Extract sources from grounding metadata
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as GroundingMetadata;
    const sources = groundingMetadata?.groundingChunks
      ?.map(chunk => chunk.web)
      .filter(web => web && web.uri && web.title)
      .map(web => ({
        title: web!.title || 'Source Web',
        uri: web!.uri!
      })) || [];

    // Filter out Wikipedia from displayed sources just in case
    const filteredSources = sources.filter(s => !s.uri.includes('wikipedia'));

    return {
      aspect,
      summary: text,
      sources: filteredSources,
      resultType: options.type
    };

  } catch (error) {
    console.error(`Error fetching research for ${aspect}:`, error);
    return {
      aspect,
      summary: "Oups ! Je n'ai pas réussi à trouver des informations pour cet aspect pour le moment.",
      sources: [],
      error: "Erreur de connexion ou de recherche."
    };
  }
};

export const fetchBrainstorming = async (subject: string): Promise<BrainstormResult> => {
  // NOTE: responseMimeType 'application/json' cannot be used with tools: [{googleSearch: {}}].
  // We use a strict text format instead and parse it manually.
  const prompt = `
    Sujet: ${subject}
    Objectif: Aider un élève de primaire (CM1/CM2) à démarrer une recherche documentaire.
    
    1. Rédige un très court paragraphe "Survol" (2-3 phrases max) qui explique simplement ce qu'est ce sujet, basé sur des faits réels et fiables.
    2. Propose exactement 5 aspects/sous-thèmes logiques et intéressants à explorer pour ce sujet.

    IMPORTANT : Ne pas utiliser de Markdown gras/italique.
    
    FORMAT DE SORTIE OBLIGATOIRE (Respecte strictement ces balises) :
    Débute ta réponse par "---OVERVIEW---" suivi du texte du survol.
    Ensuite, saute une ligne et écris "---ASPECTS---" suivi de la liste des 5 aspects (un par ligne, sans numérotation).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType removed to allow googleSearch tool
      }
    });

    const text = response.text || "";
    
    // Manual Parsing
    const parts = text.split("---ASPECTS---");
    const overviewRaw = parts[0]?.replace("---OVERVIEW---", "").trim();
    const aspectsRaw = parts[1] || "";

    const overview = overviewRaw || "Impossible de trouver un résumé pour ce sujet.";
    
    const suggestedAspects = aspectsRaw
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith("---")) // Filter empty lines or potential markers
      .map(line => line.replace(/^[-*•\d\.\)]+\s+/, "")) // Remove bullets or numbers at start
      .slice(0, 5);

    // Fallback if parsing failed
    if (suggestedAspects.length === 0) {
        suggestedAspects.push("Description", "Histoire", "Fonctionnement", "Exemples", "Importance");
    }

    return {
      overview,
      suggestedAspects
    };

  } catch (error) {
    console.error("Brainstorming error", error);
    return {
      overview: "Désolé, je n'arrive pas à analyser ce sujet pour l'instant.",
      suggestedAspects: ["L'histoire", "La description", "L'habitat", "L'alimentation", "Les particularités"]
    };
  }
};