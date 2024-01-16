import { BaseError } from '@fake.sh/backend-common';
import { faker } from '@faker-js/faker';

export function getColumnTypeForMethod(text: string) {
  const { module, method } = parseFakerSyntax(text);

  // @ts-expect-error -- we should add types later
  const result = faker[module][method]();
  const type = typeof result;

  switch (type) {
    case 'bigint':
      return 'bigint';
    case 'boolean':
      return 'boolean';
    case 'number':
      return 'integer';
    case 'object':
      return 'text';
    case 'string':
      return 'text';
    case 'symbol':
    case 'undefined':
    case 'function':
    default:
      throw new BaseError({
        code: 'INVALID_FAKER_RETURN_TYPE',
        message: 'Faker method returned invalid type',
        action: 'Make sure faker method returns a valid type',
        additionalData: {
          returnedType: type,
        },
      });
  }
}

export function callFakerMethod(text: string) {
  const { module, method } = parseFakerSyntax(text);

  // @ts-expect-error -- we should add types later
  const result = faker[module][method]();
  return result;
}

function parseFakerSyntax(text: string) {
  const parts = text.split('.');
  if (parts.length !== 2) {
    throw invalidSyntaxError(text);
  }

  const [module, method] = parts;

  const availableModules = Object.keys(faker);
  if (!availableModules.includes(module)) {
    throw invalidModuleError(module);
  }

  const availableMethods = Object.keys(faker[module as keyof typeof faker]);
  if (!availableMethods.includes(method.split(':')[0])) {
    throw invalidMethodError(module, method);
  }

  return {
    module,
    method,
  };
}

function invalidSyntaxError(text: string) {
  return new BaseError({
    code: 'INVALID_FAKER_SYNTAX',
    message: 'Can not parse provided faker syntax',
    action:
      'Make sure faker syntax is in the format: fake.<module>.<method>:<...args>,',
    additionalData: {
      provided: text,
      expected: 'fake.<module>.<method>:<...args>',
    },
  });
}

function invalidModuleError(module: string) {
  return new BaseError({
    code: 'INVALID_FAKER_MODULE',
    message: 'Provided faker module does not exist',
    action:
      'Make sure the faker module exists, check `additionalData.expected` for available modules',
    additionalData: {
      provided: module,
      expected: Object.keys(faker),
    },
  });
}

function invalidMethodError(module: string, method: string) {
  return new BaseError({
    code: 'INVALID_FAKER_METHOD',
    message: 'Provided faker method does not exist',
    action:
      'Make sure the faker method exists, check `additionalData.expected` for available methods',
    additionalData: {
      provided: method,
      expected: Object.keys(faker[module as keyof typeof faker]),
    },
  });
}
