import { BaseError } from '@fake.sh/backend-common';
import { faker } from '@faker-js/faker';

export function callFakerMethod(text: string) {
  const { module, method } = parseFakerSyntax(text);

  // @ts-expect-error -- we should add types later
  const result = faker[module][method]();
  return result;
}

export function parseFakerSyntax(text: string) {
  const parts = text.split('.');
  if (parts.length !== 3) {
    throw invalidSyntaxError(text);
  }

  const [fakerSignature, module, method] = parts;
  if (fakerSignature !== 'generate') {
    throw invalidSyntaxError(text);
  }

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

export function isFakerSyntax(columnValue: string) {
  try {
    parseFakerSyntax(columnValue);
    return true;
  } catch {
    return false;
  }
}

function invalidSyntaxError(text: string) {
  return new BaseError({
    code: 'INVALID_FAKER_SYNTAX',
    message: 'Can not parse provided faker syntax',
    action:
      'Make sure faker syntax is in the format: generate.<module>.<method>',
    additionalData: {
      provided: text,
      expected: 'generate.<module>.<method>',
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
