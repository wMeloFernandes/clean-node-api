import { SignUpController } from './signup'
import { MissingParamError, InvalidParamError, ServerError } from '../errors'
import { EmailValidator } from '../protocols'

interface SutTypes {
  sut: SignUpController
  emailValidator: EmailValidator
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
  const sut = new SignUpController(emailValidator)
  return {
    sut,
    emailValidator
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
})
