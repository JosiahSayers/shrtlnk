import Joi from "joi";
import { ActionFunction, Form, json, useActionData, useSearchParams } from "remix";
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  useColorModeValue,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react';
import { validate } from "~/utils/get-validation-errors.server";
import { createUserSession, signin } from "~/utils/session.server";
import { useEffect } from "react";

type ActionData = {
  formLevelError?: string;
  errors?: {
    email?: string;
    password?: string;
  };
  fields?: {
    email?: string;
    password?: string;
  };
};

const validateForm = (form: {
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
}) => {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });
  return validate(schema, form);
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get("email");
  const password = form.get("password");
  const redirectTo = form.get("redirectTo");

  const { fields, errors } = validateForm({ email, password });

  if (errors) {
    return json(
      {
        errors,
        fields,
      },
      { status: 400 }
    );
  }

  const user = await signin(fields);
  if (user) {
    return createUserSession(
      user,
      (redirectTo as string) || "/developer/applications"
    );
  }

  return json(
    {
      formLevelError: "Could not log you in with these credentials",
      fields: fields,
    },
    { status: 400 }
  );
};

export default function SimpleCard() {
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  
  useEffect(() => {
    if (actionData?.formLevelError) {
      toast({
        title: 'Error',
        description: actionData.formLevelError,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  }, [actionData]);

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'}>Sign in to your account</Heading>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          p={8}>
          <Form method="post" noValidate>
          <input
            type="hidden"
            name="redirectTo"
            value={searchParams.get("redirectTo") ?? undefined}
          />
          <Stack spacing={4}>
            <FormControl id="email" isInvalid={!!actionData?.errors?.email}>
              <FormLabel>Email address</FormLabel>
              <Input type="email" name="email" defaultValue={actionData?.fields?.email} />
              {actionData?.errors?.email && <FormErrorMessage>{actionData.errors.email}</FormErrorMessage>}
            </FormControl>
            <FormControl id="password" isInvalid={!!actionData?.errors?.password}>
              <FormLabel>Password</FormLabel>
              <Input type="password" name="password" defaultValue={actionData?.fields?.password} />
              {actionData?.errors?.password && <FormErrorMessage>{actionData.errors.password}</FormErrorMessage>}
            </FormControl>
            <Stack spacing={10}>
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                align={'start'}
                justify={'space-between'}>
              </Stack>
              <Button
                bg={'blue.400'}
                color={'white'}
                type="submit"
                onClick={() => toast.closeAll()}
                _hover={{
                  bg: 'blue.500',
                }}>
                Sign in
              </Button>
            </Stack>
          </Stack>
          </Form>
        </Box>
      </Stack>
    </Flex>
  );
}
