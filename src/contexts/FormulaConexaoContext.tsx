import React, { createContext, useContext, useState } from "react";

interface FormulaConexaoData {
  nome: string;
  negocio: string;
  cpfCnpj: string;
  email: string;
  whatsapp: string;
  nicho: string;
  codigo: string;
}

interface FormulaConexaoContextType {
  data: FormulaConexaoData;
  setData: React.Dispatch<React.SetStateAction<FormulaConexaoData>>;
  quizCompleted: boolean;
  setQuizCompleted: (v: boolean) => void;
}

const FormulaConexaoContext = createContext<FormulaConexaoContextType | null>(null);

export function FormulaConexaoProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<FormulaConexaoData>({
    nome: "",
    negocio: "",
    cpfCnpj: "",
    email: "",
    whatsapp: "",
    nicho: "",
    codigo: "",
  });
  const [quizCompleted, setQuizCompleted] = useState(false);

  return (
    <FormulaConexaoContext.Provider value={{ data, setData, quizCompleted, setQuizCompleted }}>
      {children}
    </FormulaConexaoContext.Provider>
  );
}

export function useFormulaConexao() {
  const ctx = useContext(FormulaConexaoContext);
  if (!ctx) throw new Error("useFormulaConexao must be used inside FormulaConexaoProvider");
  return ctx;
}
