import { SignUpController } from './signup'
import { MissingParamError, InvalidParamError, ServerError } from '../../errors'
import { EmailValidator, AddAccount, AddAccountModel, AccountModel } from './signup-protocols'

interface SutTypes {
  sut: SignUpController
  emailValidator: EmailValidator
  addAccount: AddAccount
}

const makeAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    add (account: AddAccountModel): AccountModel {
      const fakeAccount = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email',
        password: 'valid_password'
      }
      return fakeAccount
    }
  }
  return new AddAccountStub()
}

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}

const makeSut = (): SutTypes => {
  const emailValidator = makeEmailValidator()
  const addAccount = makeAddAccount()
  const sut = new SignUpController(emailValidator, addAccount)
  return {
    sut,
    emailValidator,
    addAccount
  }
}

describe('SignUp Controller', () => {
  test('Should return 400 if no name is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'email@gmail.com',
        password: 'secret_password',
        passwordConfirmation: 'secret_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })

  test('Should return 400 if no email is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'Willian Melo',
        password: 'secret_password',
        passwordConfirmation: 'secret_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('Should return 400 if no password is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'Willian Melo',
        email: 'email@gmail.com',
        passwordConfirmation: 'secret_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('Should return 400 if no passwordConfirmation is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'Willian Melo',
        email: 'email@gmail.com',
        password: 'secret_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))
  })

  test('Should return 400 if no password confirmation fails', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'Willian Melo',
        email: 'email@gmail.com',
        password: 'secret_password',
        passwordConfirmation: 'invalid_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirmation'))
  })

  test('Should return 400 if invalid email is provided', () => {
    const { sut, emailValidator } = makeSut()
    // Alter default value of instance
    jest.spyOn(emailValidator, 'isValid').mockReturnValueOnce(false)
    const httpRequest = {
      body: {
        name: 'Willian Melo',
        email: 'invalid_email@gmail.com',
        password: 'secret_password',
        passwordConfirmation: 'secret_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  test('Should call EmailValidator with correct email', () => {
    const { sut, emailValidator } = makeSut()
    // Spy isValid method
    const isValidSpy = jest.spyOn(emailValidator, 'isValid')
    const httpRequest = {
      body: {
        name: 'Willian Melo',
        email: 'email@gmail.com',
        password: 'secret_password',
        passwordConfirmation: 'secret_password'
      }
    }
    sut.handle(httpRequest)
    expect(isValidSpy).toHaveBeenCalledWith('email@gmail.com')
  })

  test('Should return 500 if EmailValidator throws', () => {
    const { sut, emailValidator } = makeSut()

    // Alter default value of instance
    jest.spyOn(emailValidator, 'isValid').mockImplementation(() => {
      throw new Error()
    })

    const httpRequest = {
      body: {
        name: 'Willian Melo',
        email: 'email@gmail.com',
        password: 'secret_password',
        passwordConfirmation: 'secret_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should call AddAccount with correct values', () => {
    const { sut, addAccount } = makeSut()
    // Spy isValid method
    const addSpy = jest.spyOn(addAccount, 'add')
    const httpRequest = {
      body: {
        name: 'Willian Melo',
        email: 'email@gmail.com',
        password: 'secret_password',
        passwordConfirmation: 'secret_password'
      }
    }
    sut.handle(httpRequest)
    expect(addSpy).toHaveBeenCalledWith({
      name: 'Willian Melo',
      email: 'email@gmail.com',
      password: 'secret_password'
    })
  })

  test('Should return 500 if AddAccount throws', () => {
    const { sut, addAccount } = makeSut()

    // Alter default value of instance
    jest.spyOn(addAccount, 'add').mockImplementation(() => {
      throw new Error()
    })

    const httpRequest = {
      body: {
        name: 'Willian Melo',
        email: 'email@gmail.com',
        password: 'secret_password',
        passwordConfirmation: 'secret_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('Should return 200 if valid data is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'valid_email',
        password: 'valid_password',
        passwordConfirmation: 'valid_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({
      id: 'valid_id',
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password'
    })
  })
})
