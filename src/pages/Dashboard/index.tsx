import React, { useState, useEffect } from 'react';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: Date;
}

type OmitTransaction = Omit<
  Transaction,
  'formattedValue' | 'formattedDate' | 'created_at'
>;

interface BaseTransaction extends OmitTransaction {
  created_at: string;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);
  const [error, setError] = useState<string>('');
  const [loaded, setLoaded] = useState<boolean>(false);
  const [update, setUpdate] = useState<boolean>(false);

  const f = (x: number): string => {
    return formatValue(x);
    // return Intl.NumberFormat('pt', {
    //   minimumFractionDigits: 2,
    //   maximumFractionDigits: 2,
    // }).format(x);
  };

  const d = (x: string): string => {
    return Intl.DateTimeFormat('pt').format(Date.parse(x));
  };

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      try {
        const { data } = await api.get('transactions');
        // TODO ajustar a função para carregar os dados e criar os valores inexistentes presente na interface
        const baseTransaction: BaseTransaction[] = data.transactions;

        const augmentedTransactions: Transaction[] = baseTransaction.map(e => {
          const mappedValue: Transaction = {
            category: e.category,
            // eslint-disable-next-line @typescript-eslint/camelcase
            created_at: new Date(Date.parse(e.created_at)),
            id: e.id,
            title: e.title,
            type: e.type,
            value: e.value,
            formattedDate: d(e.created_at),
            formattedValue: f(e.value),
          };
          return mappedValue;
        });
        const simpleBalance = data.balance;
        const augmentedBalance: Balance = {
          income: f(simpleBalance.income),
          outcome: f(simpleBalance.outcome),
          total: f(simpleBalance.total),
        };

        setTransactions(augmentedTransactions);
        setBalance(augmentedBalance);
        setLoaded(true);
        setUpdate(false);
      } catch (err) {
        // setLoaded(true);
        setError('Não foi possível carregar os dados');
      }
    }

    loadTransactions();
  }, [update]);

  const handleRemove = async (id: string) => {
    try {
      await api.delete(`transactions/${id}`);
      setUpdate(true);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {loaded && (
        <>
          <Header />
          <Container>
            <CardContainer>
              <Card>
                <header>
                  <p>Entradas</p>
                  <img src={income} alt="Income" />
                </header>
                <h1 data-testid="balance-income">
                  R$
                  {balance.income}
                </h1>
              </Card>
              <Card>
                <header>
                  <p>Saídas</p>
                  <img src={outcome} alt="Outcome" />
                </header>
                <h1 data-testid="balance-outcome">
                  R$
                  {balance.outcome}
                </h1>
              </Card>
              <Card total>
                <header>
                  <p>Total</p>
                  <img src={total} alt="Total" />
                </header>
                <h1 data-testid="balance-total">
                  R$
                  {balance.total}
                </h1>
              </Card>
            </CardContainer>

            <TableContainer>
              <table>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Preço</th>
                    <th>Categoria</th>
                    <th>Data</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map(e => (
                    <tr>
                      <td className="title" onClick={() => handleRemove(e.id)}>
                        {`${e.title}`}
                      </td>
                      <td className={e.type}>
                        {`${e.type === 'income' ? '' : '- '}
                          ${e.formattedValue}`}
                      </td>
                      <td>{e.category.title}</td>
                      <td>{e.formattedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableContainer>
          </Container>
        </>
      )}
    </>
  );
};

export default Dashboard;
