import React, { useState, useEffect } from 'react';
import './App.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

function App() {
  const [entradas, setEntradas] = useState([]);
  const [data, setData] = useState('');
  const [acao, setAcao] = useState('');
  const [tipoLiquido, setTipoLiquido] = useState('');
  const [outroLiquido, setOutroLiquido] = useState('');
  const [hora, setHora] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [urgencia, setUrgencia] = useState(false);
  const [intensidade, setIntensidade] = useState('');
  const [perdaQuantidade, setPerdaQuantidade] = useState('');
  const [perdaMotivo, setPerdaMotivo] = useState('');
  const [outroMotivo, setOutroMotivo] = useState('');
  const [observacao, setObservacao] = useState('');
  const [activeTab, setActiveTab] = useState('manual'); // Estado para controlar a aba ativa

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setData(today);

    const storedEntradas = localStorage.getItem('diarioMiccional');
    if (storedEntradas) {
      setEntradas(JSON.parse(storedEntradas));
    }
  }, []);

  useEffect(() => {
    if (entradas.length > 0) {
      localStorage.setItem('diarioMiccional', JSON.stringify(entradas));
    }
  }, [entradas]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const novaEntrada = {
      data,
      acao,
      tipoLiquido,
      outroLiquido,
      hora,
      quantidade,
      urgencia,
      intensidade,
      perdaQuantidade,
      perdaMotivo,
      outroMotivo,
      observacao,
    };

    const novasEntradas = [...entradas, novaEntrada].sort((a, b) => {
      const dateA = new Date(`${a.data}T${a.hora}`);
      const dateB = new Date(`${b.data}T${b.hora}`);
      return dateA - dateB;
    });

    setEntradas(novasEntradas);

    const today = new Date().toISOString().split('T')[0];
    setData(today);
    setAcao('');
    setTipoLiquido('');
    setOutroLiquido('');
    setHora('');
    setQuantidade('');
    setUrgencia(false);
    setIntensidade('');
    setPerdaQuantidade('');
    setPerdaMotivo('');
    setOutroMotivo('');
    setObservacao('');
  };

  const handleDelete = (index) => {
    const novasEntradas = entradas.filter((_, i) => i !== index);
    setEntradas(novasEntradas);
    localStorage.setItem('diarioMiccional', JSON.stringify(novasEntradas));
  };

  const downloadPDF = () => {
    const doc = new jsPDF('landscape');

    doc.text("Diário Miccional", 10, 10);

    doc.autoTable({
      head: [['Data', 'Ação', 'Hora', 'Quantidade (ml)', 'Tipo de Líquido', 'Urgência', 'Intensidade', 'Perda Quantidade', 'Perda Motivo', 'Observação']],
      body: entradas.map(entrada => [
        entrada.data,
        entrada.acao,
        entrada.hora,
        entrada.quantidade,
        entrada.tipoLiquido === 'outros' ? `${entrada.tipoLiquido} (${entrada.outroLiquido})` : entrada.tipoLiquido,
        entrada.urgencia ? 'Sim' : 'Não',
        entrada.intensidade,
        entrada.perdaQuantidade,
        entrada.perdaMotivo === 'outros' ? `${entrada.perdaMotivo} (${entrada.outroMotivo})` : entrada.perdaMotivo,
        entrada.observacao
      ]),
      startY: 20,
      styles: {
        textColor: [0, 0, 0],
        fillColor: [255, 255, 0]
      },
      headStyles: {
        fillColor: [255, 255, 0]
      }
    });

    doc.save("diario_miccional.pdf");
  };

  const downloadJSON = () => {
    const json = JSON.stringify(entradas, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diario_miccional.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          const novasEntradas = json.filter(novaEntrada => {
            return !entradas.some(entrada =>
              entrada.data === novaEntrada.data &&
              entrada.acao === novaEntrada.acao &&
              entrada.hora === novaEntrada.hora &&
              entrada.quantidade === novaEntrada.quantidade &&
              entrada.tipoLiquido === novaEntrada.tipoLiquido &&
              entrada.outroLiquido === novaEntrada.outroLiquido &&
              entrada.urgencia === novaEntrada.urgencia &&
              entrada.intensidade === novaEntrada.intensidade &&
              entrada.perdaQuantidade === novaEntrada.perdaQuantidade &&
              entrada.perdaMotivo === novaEntrada.perdaMotivo &&
              entrada.outroMotivo === novaEntrada.outroMotivo &&
              entrada.observacao === novaEntrada.observacao
            );
          });

          setEntradas(prevEntradas => [...prevEntradas, ...novasEntradas]);
        } catch (error) {
          console.error("Erro ao ler o arquivo JSON:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <div className="container">
        <h1>Diário Miccional</h1>
        <div className="tabs" style={{display: 'flex', marginBottom: '20px'}}>
          <button onClick={() => setActiveTab('manual')} className={activeTab === 'manual' ? 'active' : ''}>Infos Manuais</button>
          <button onClick={() => setActiveTab('mass')} className={activeTab === 'mass' ? 'active' : ''}>Infos em Massa</button>
        </div>
        {activeTab === 'manual' && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="data">Data:</label>
              <input
                type="date"
                id="data"
                value={data}
                onChange={(e) => setData(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="acao">Tipo de Ação:</label>
              <select
                id="acao"
                value={acao}
                onChange={(e) => setAcao(e.target.value)}
                required
              >
                <option value="">Selecione</option>
                <option value="ingerido">Ingerido</option>
                <option value="eliminado">Eliminado</option>
                <option value="perda">Perda</option>
              </select>
            </div>

            {acao === 'ingerido' && (
              <>
                <div className="form-group">
                  <label htmlFor="tipoLiquido">Tipo de Líquido:</label>
                  <select
                    id="tipoLiquido"
                    value={tipoLiquido}
                    onChange={(e) => setTipoLiquido(e.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="agua">Água</option>
                    <option value="cafe">Café</option>
                    <option value="suco">Suco</option>
                    <option value="refrigerante">Refrigerante</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                {tipoLiquido === 'outros' && (
                  <div className="form-group">
                    <label htmlFor="outroLiquido">Especifique:</label>
                    <input
                      type="text"
                      id="outroLiquido"
                      value={outroLiquido}
                      onChange={(e) => setOutroLiquido(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="hora">Hora:</label>
                  <input
                    type="time"
                    id="hora"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="quantidade">Quantidade (ml):</label>
                  <input
                    type="text"
                    id="quantidade"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="observacao">Observação:</label>
                  <textarea
                    id="observacao"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                  />
                </div>
              </>
            )}

            {acao === 'eliminado' && (
              <>
                <div className="form-group">
                  <label>Tipo:</label>
                  <input type="text" value="Urina" readOnly />
                </div>
                <div className="form-group">
                  <label htmlFor="hora">Hora:</label>
                  <input
                    type="time"
                    id="hora"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="quantidade">Quantidade (ml):</label>
                  <input
                    type="text"
                    id="quantidade"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="urgencia">Urgência:</label>
                  <input
                    type="checkbox"
                    id="urgencia"
                    checked={urgencia}
                    onChange={(e) => setUrgencia(e.target.checked)}
                  />
                </div>
                {urgencia && (
                  <div className="form-group">
                    <label htmlFor="intensidade">Intensidade:</label>
                    <select
                      id="intensidade"
                      value={intensidade}
                      onChange={(e) => setIntensidade(e.target.value)}
                      required
                    >
                      <option value="">Selecione</option>
                      <option value="pouco">Pouco</option>
                      <option value="medio">Médio</option>
                      <option value="extremo">Extremo</option>
                    </select>
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="observacao">Observação:</label>
                  <textarea
                    id="observacao"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                  />
                </div>
              </>
            )}

            {acao === 'perda' && (
              <>
                <div className="form-group">
                  <label htmlFor="perdaQuantidade">Quantidade:</label>
                  <select
                    id="perdaQuantidade"
                    value={perdaQuantidade}
                    onChange={(e) => setPerdaQuantidade(e.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="colher">Colher</option>
                    <option value="gotas">Gotas</option>
                    <option value="escorrer">Escorrer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="hora">Hora:</label>
                  <input
                    type="time"
                    id="hora"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="perdaMotivo">Motivo:</label>
                  <select
                    id="perdaMotivo"
                    value={perdaMotivo}
                    onChange={(e) => setPerdaMotivo(e.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="riso">Riso</option>
                    <option value="espirro">Espirro</option>
                    <option value="tosse">Tosse</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                {perdaMotivo === 'outros' && (
                  <div className="form-group">
                    <label htmlFor="outroMotivo">Especifique:</label>
                    <input
                      type="text"
                      id="outroMotivo"
                      value={outroMotivo}
                      onChange={(e) => setOutroMotivo(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="observacao">Observação:</label>
                  <textarea
                    id="observacao"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                  />
                </div>
              </>
            )}

            <button type="submit">Adicionar Entrada</button>
          </form>
        )}
        {activeTab === 'mass' && (
          <div>
            <input type="file" accept=".json" onChange={handleFileUpload} />
          </div>
        )}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Data</th>
                <th>Ação</th>
                <th>Hora</th>
                <th>Quantidade (ml)</th>
                <th>Tipo de Líquido</th>
                <th>Urgência</th>
                <th>Intensidade</th>
                <th>Perda Quantidade</th>
                <th>Perda Motivo</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>
              {entradas.map((entrada, index) => (
                <tr key={index}>
                  <td>
                    <button className="delete-button" title='Excluir' onClick={() => handleDelete(index)}>🗑️</button>
                  </td>
                  <td>{entrada.data}</td>
                  <td>{entrada.acao}</td>
                  <td>{entrada.hora}</td>
                  <td>{entrada.quantidade}</td>
                  <td>
                    {entrada.tipoLiquido}
                    {entrada.tipoLiquido === 'outros' && ` (${entrada.outroLiquido})`}
                  </td>
                  <td>{entrada.urgencia ? 'Sim' : 'Não'}</td>
                  <td>{entrada.intensidade}</td>
                  <td>{entrada.perdaQuantidade}</td>
                  <td>
                    {entrada.perdaMotivo}
                    {entrada.perdaMotivo === 'outros' && ` (${entrada.outroMotivo})`}
                  </td>
                  <td>{entrada.observacao}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="floating-button" onClick={downloadPDF} title="Baixar tabela como PDF">📄</button>
        <button className="floating-button" onClick={downloadJSON} title="Baixar tabela como JSON" style={{ right: '80px', marginRight: '10px' }}>💾</button>
      </div>
    </div>
  );
}

export default App;
