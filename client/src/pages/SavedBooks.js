import React from 'react';
import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';

import { useMutation, useQuery } from '@apollo/client';
import { GET_ME } from '../utils/queries'
import { REMOVE_BOOK } from '../utils/mutations'
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const SaveBooks = () => {
  const { loading, data } = useQuery(GET_ME);
  const [removeBook, { error }] = useMutation(REMOVE_BOOK);
  const userData = data?.me || {};

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    console.log(token)
    if (!token) {
      return false;
    }

    try {
      const { data } = await removeBook({
        variables: { bookId },

      });
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };
  if (loading) {
    return <h2>LOADING...</h2>;


  }

  console.log('LOADING!!!!!! query', loading)
  console.log('DATA query!!!', data)

  return (
    <>
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {userData.savedBook?.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <CardColumns>
          {userData.savedBooks ? userData.savedBooks.map((book) => {
            return (
              <Card key={book.bookId} border='dark'>
                {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            );
          }) : null};
        </CardColumns>
      </Container>
    </>
  );
};

export default SaveBooks;
