import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSignUp } from "@/hooks/useAuth";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import fashionImage from "@/assets/6.webp";

const Signup = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, loading } = useSignUp();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('common.error'));
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t('common.error'));
      return;
    }

    try {
      await signUp(formData);
      toast.success(t('common.success'));
    } catch (err: any) {
      toast.error(err?.message || t('common.error'));
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex flex-col lg:flex-row flex-1 items-stretch">
        {/* Left Image Section */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img
            src={fashionImage}
            alt="Signup fashion"
            className="w-full h-[700px] object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-10 left-10 text-white space-y-2">
            <h2 className="text-3xl font-bold">{t('auth.joinFashionWorld')}</h2>
            <p className="text-lg max-w-sm">
              {t('auth.startShoppingToday')}
            </p>
          </div>
        </div>

        {/* Signup Form Section */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Card className="border-0 ">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-3xl font-bold">{t('auth.createAccount')}</CardTitle>
                <p className="text-sm text-muted-foreground">{t('auth.joinAndExplore')}</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <InputField
                    id="name"
                    label={t('auth.fullName')}
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <InputField
                    id="email"
                    label={t('auth.email')}
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <InputField
                    id="phone"
                    label={t('auth.phoneNumber')}
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  <InputField
                    id="address"
                    label={t('auth.address')}
                    value={formData.address}
                    onChange={handleChange}
                  />

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t('auth.createPassword')}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="rounded-xl pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t('auth.confirmPasswordPlaceholder')}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="rounded-xl pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full rounded-xl text-base" disabled={loading}>
                    {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    {t('auth.alreadyHaveAccount')}{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      {t('auth.signIn')}
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Signup;

// 👇 Reusable input field component
const InputField = ({
  id,
  label,
  type = "text",
  value,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={`${t('auth.enterYour')} ${label.toLowerCase()}`}
        required
        className="rounded-xl"
      />
    </div>
  );
};
