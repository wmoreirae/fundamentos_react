import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import filesize from 'filesize';

import Header from '../../components/Header';
import FileList from '../../components/FileList';
import Upload from '../../components/Upload';

import { Container, Title, ImportFileContainer, Footer } from './styles';

import alert from '../../assets/alert.svg';
import api from '../../services/api';

interface FileProps {
  file: File;
  name: string;
  readableSize: string;
}

const Import: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<FileProps[]>([]);
  const history = useHistory();

  async function handleUpload(): Promise<void> {
    const upPromises = uploadedFiles.map(async e => {
      const data = new FormData();
      data.append('file', e.file, e.name);
      try {
        const response = await api.post('/transactions/import', data);
      } catch (err) {
        console.log(err.response.error);
      }
    });
    await Promise.all(upPromises);
    history.push('/');
  }

  function submitFile(files: File[]): void {
    const fileProps: FileProps[] = files.map(e => {
      const fileProp: FileProps = {
        file: e,
        name: e.name,
        readableSize: `${e.size}`,
      };
      return fileProp;
    });
    setUploadedFiles(fileProps);
  }

  return (
    <>
      <Header size="small" />
      <Container>
        <Title>Importar uma transação</Title>
        <ImportFileContainer>
          <Upload onUpload={submitFile} />
          {!!uploadedFiles.length && <FileList files={uploadedFiles} />}

          <Footer>
            <p>
              <img src={alert} alt="Alert" />
              Permitido apenas arquivos CSV
            </p>
            <button onClick={handleUpload} type="button">
              Enviar
            </button>
          </Footer>
        </ImportFileContainer>
      </Container>
    </>
  );
};

export default Import;
