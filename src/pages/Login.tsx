import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "react-toastify";
import { useSignIn } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import fashionImage from "@/assets/stylish-girl-sits-chair.jpg"; 

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, loading } = useSignIn();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn({ email, password });
      if (result?.user?.role === 'superAdmin' || result?.user?.role === 'admin') {
        toast.success(t('common.success'));
      } else {
        toast.success(t('common.success'));
      }
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
            alt="Fashion promo"
            className="w-full h-[700px] object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-10 left-10 text-white space-y-2">
            <h2 className="text-3xl font-bold">{t('home.exploreNewStyles')}</h2>
            <p className="text-lg max-w-sm">
              {t('auth.startShoppingToday')}
            </p>
          </div>
        </div>

        {/* Right Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Card className="border-0 ">
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-3xl font-bold">👋 {t('auth.login')}</CardTitle>
                <p className="text-sm text-muted-foreground">{t('auth.signIn')}</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('auth.enterYourEmail')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full rounded-xl text-base" disabled={loading}>
                    {loading ? t('auth.sending') : t('auth.signIn')}
                  </Button>
                </form>

                <div className="mt-6 text-center space-y-2">
                  <p className="text-sm">
                    <Link to="/forgot-password" className="text-primary hover:underline">
                      {t('auth.forgotPassword')}
                    </Link>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t('auth.dontHaveAccount')}{" "}
                    <Link to="/signup" className="text-primary font-medium hover:underline">
                      {t('auth.createAccount')}
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

export default Login;
